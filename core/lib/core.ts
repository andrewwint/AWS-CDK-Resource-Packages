import * as path from 'path';
import * as dotenv from 'dotenv';
import { Construct, SecretValue } from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2'
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as certificatemanager from '@aws-cdk/aws-certificatemanager';

dotenv.config({
  path: path.join(__dirname, '.env')
})
export interface CoreProps {
  readonly vpc?: ec2.IVpc
  readonly zone_name?: string
  readonly hosted_zone_id?: string
  readonly zone_cert?: certificatemanager.ICertificate
}
export class CoreConstruct extends Construct {

  // use ssm:
  // https://docs.aws.amazon.com/cdk/latest/guide/get_ssm_value.htmlSe

  public readonly vpc = process.env.VPC
  public readonly ec2_instance_efs = process.env.EC2_INSTANCE_EFS
  public readonly zone_name = process.env.ZONE_NAME
  public readonly hosted_zone_id = process.env.HOSTED_ZONE_ID
  public readonly zone_cert = process.env.ZONE_CERT

  constructor(scope: Construct, id: string, config?: CoreProps) {
    super(scope, id);

  }
  /**
   * getBitBucketCreds
   */
  public getBitBucketCreds() {
    return new codebuild.BitBucketSourceCredentials(this, "MyCoBitBucketAccess", {
      //username: SecretValue.secretsManager('/bitbucket/username'),
      //password: SecretValue.secretsManager('/bitbucket/password'),
      password: SecretValue.plainText(<string>process.env.BITBUCKET_PASSWORD),
      username: SecretValue.plainText(<string>process.env.BITBUCKET_USERNAME),
    })
  }

}

export default CoreConstruct