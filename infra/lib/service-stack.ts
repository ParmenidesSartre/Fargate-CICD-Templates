import * as cdk from "aws-cdk-lib";
import {
  aws_certificatemanager as acm,
  aws_ecs as ecs,
  aws_ecs_patterns as ecsPatterns,
  aws_elasticloadbalancingv2 as elbv2,
  aws_logs as logs,
  aws_ecr as ecr,
  Tags,
} from "aws-cdk-lib";
import { Construct } from "constructs";

export interface ServiceStackProps extends cdk.StackProps {
  vpc: cdk.aws_ec2.Vpc;
  hostedZone: cdk.aws_route53.IHostedZone;
  imageTag: string;
  envName: string;
}

export class ServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ServiceStackProps) {
    super(scope, id, props);

    const domainName = this.node.tryGetContext("domainName");
    const subdomain = "noesis";
    const fullDomain = `${subdomain}.${domainName}`;
    const imageTag = props.imageTag;

    const repo = ecr.Repository.fromRepositoryName(this, "AppRepo", "my-fargate-app");
    const certificate = acm.Certificate.fromCertificateArn(this, "cert",
      "arn:aws:acm:ap-southeast-5:555745306296:certificate/50f207de-f8e6-42e4-93ca-a728a5033036"
    );

    const cluster = new ecs.Cluster(this, "Cluster", { vpc: props.vpc });

    const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, "Service", {
      cluster,
      cpu: 256,
      memoryLimitMiB: 512,
      desiredCount: 1,
      publicLoadBalancer: true,
      domainName: fullDomain,
      domainZone: props.hostedZone,
      certificate,
      protocol: elbv2.ApplicationProtocol.HTTPS,
      redirectHTTP: true,
      assignPublicIp: false,
      taskSubnets: { subnetType: cdk.aws_ec2.SubnetType.PRIVATE_ISOLATED },
      listenerPort: 443,
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(repo, imageTag),
        containerPort: 80,
        logDriver: ecs.LogDriver.awsLogs({
          streamPrefix: `${props.envName}`,
          logRetention: logs.RetentionDays.ONE_WEEK,
        }),
        environment: {
          IMAGE_TAG: imageTag,
        },
      },
      healthCheckGracePeriod: cdk.Duration.seconds(60),
    });

    fargateService.targetGroup.configureHealthCheck({
      path: "/",
      healthyHttpCodes: "200-399",
    });

    new cdk.CfnOutput(this, "AppURL", {
      value: `https://${fullDomain}`,
    });

    Tags.of(this).add("Project", "noesis");
    Tags.of(this).add("Environment", props.envName);
  }
}
