import * as cdk from "aws-cdk-lib";
import { aws_ec2 as ec2, aws_route53 as route53 } from "aws-cdk-lib";
import { Construct } from "constructs";

export interface NetworkStackProps extends cdk.StackProps {
  envName: string;
}

export class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly hostedZone: route53.IHostedZone;

  constructor(scope: Construct, id: string, props: NetworkStackProps) {
    super(scope, id, props);

    const domainName = this.node.tryGetContext("domainName");
    const hostedZoneId = this.node.tryGetContext("hostedZoneId");

    this.vpc = new ec2.Vpc(this, `${props.envName}-vpc`, {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        { name: "public", subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24 },
        { name: "private", subnetType: ec2.SubnetType.PRIVATE_ISOLATED, cidrMask: 24 },
      ],
    });

    // ✅ Add VPC Endpoints to allow private ECS tasks to reach AWS services
    this.vpc.addInterfaceEndpoint("EcrDockerEndpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER,
    });

    this.vpc.addInterfaceEndpoint("EcrApiEndpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.ECR,
    });

    this.vpc.addInterfaceEndpoint("CloudWatchLogsEndpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
    });

    this.vpc.addGatewayEndpoint("S3Endpoint", {
      service: ec2.GatewayVpcEndpointAwsService.S3,
    });

    this.hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, `${props.envName}-hz`, {
      hostedZoneId,
      zoneName: domainName,
    });
  }
}
