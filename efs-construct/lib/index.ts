import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as efs from '@aws-cdk/aws-efs';

export interface EfsConstructProps {
  vpc?: ec2.IVpc,
  instanceId?: ec2.IInstance
}

export class EfsConstruct extends cdk.Construct {

  public readonly fileSystem: efs.FileSystem

  constructor(scope: cdk.Construct, id: string, props: EfsConstructProps = {}) {
    super(scope, id);

    //Configure Electic File System:
    this.fileSystem = new efs.FileSystem(this, 'MyEfsFileSystem', {
      vpc: props.vpc || new ec2.Vpc(this, 'VPC'),
      encrypted: true, // file system is not encrypted by default
      lifecyclePolicy: efs.LifecyclePolicy.AFTER_30_DAYS, // files are not transitioned to infrequent access (IA) storage by default
      performanceMode: efs.PerformanceMode.GENERAL_PURPOSE, // default
      throughputMode: efs.ThroughputMode.BURSTING
    });

    const params = {
      FileSystemId: this.fileSystem.fileSystemId,
      PosixUser: {
        Gid: 1000,
        Uid: 1000
      },
      RootDirectory: {
        CreationInfo: {
          OwnerGid: 1000,
          OwnerUid: 1000,
          Permissions: '755'
        },
        Path: '/efs'
      },
      Tags: [
        {
          Key: 'Name',
          Value: 'ecsefs'
        }
      ]
    };

    new cdk.CfnOutput(this, 'Output', {
      value: <string>this.fileSystem.fileSystemId
    })

  }
}
