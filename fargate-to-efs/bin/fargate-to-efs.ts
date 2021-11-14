#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { FargateToEfsStack } from '../lib/fargate-to-efs-stack';

const app = new cdk.App();
new FargateToEfsStack(app, 'FargateToEfsStack', { containerName: 'name' });
