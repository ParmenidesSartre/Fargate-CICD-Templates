#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack';
import { ServiceStack } from '../lib/service-stack';

const app = new cdk.App();
const imageTag = process.env.IMAGE_TAG || 'latest';
const envName = process.env.ENV_NAME || 'dev';

const account = '555745306296';
const region = 'ap-southeast-5';

const network = new NetworkStack(app, `MyFargateNetworkStack-${envName}`, {
  env: { account, region },
  envName
});

new ServiceStack(app, `MyFargateServiceStack-${envName}`, {
  env: { account, region },
  vpc: network.vpc,
  hostedZone: network.hostedZone,
  imageTag,
  envName
});
