import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as FargateToEfs from '../lib/fargate-to-efs-stack';

test('Empty Stack', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new FargateToEfs.FargateToEfsStack(app, 'MyTestStack', { containerName: 'name' });
  // THEN
  expectCDK(stack).to(matchTemplate({
    "Resources": {}
  }, MatchStyle.EXACT))
});
