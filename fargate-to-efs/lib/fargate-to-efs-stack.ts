import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2'
import * as my_company_core from '@awint/core';
import * as ecs from '@aws-cdk/aws-ecs'
import * as ecs_patterns from '@aws-cdk/aws-ecs-patterns';
import * as efs from '@aws-cdk/aws-efs';
import * as cr from '@aws-cdk/custom-resources';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ecr_assets from '@aws-cdk/aws-ecr-assets';
import * as logs from '@aws-cdk/aws-logs';
import * as route53 from '@aws-cdk/aws-route53';
import * as certificatemanager from '@aws-cdk/aws-certificatemanager';
import * as ecr from '@aws-cdk/aws-ecr';
export interface FargateToEfsStackProps {
  containerfromAsset?: string,
  containerfromRegistry?: string,
  containerPort?: number,
  desiredCount?: number,
  memoryLimitMiB?: number,
  cpu?: number,
  dockerfile?: string,
  subDomainName?: string,
  containerName: string
}
export class FargateToEfsStack extends cdk.Construct {

  public readonly renderContainerDefinition: ecs.CfnTaskDefinition.ContainerDefinitionProperty
  public readonly albFargateService: ecs_patterns.ApplicationLoadBalancedFargateService
  public readonly ecr_asset: ecr_assets.DockerImageAsset
  public readonly ecrRepository: ecr.Repository

  constructor(scope: cdk.Construct, id: string, props: FargateToEfsStackProps) {
    super(scope, id);

    const core = new my_company_core.CoreConstruct(this, "MyCoCore")
    const vpc = ec2.Vpc.fromLookup(this, 'MyCoVpc', { vpcId: core.vpc }) //using and exiting vpc
    const ecsCluster = new ecs.Cluster(this, 'MyCoCluster', { vpc: vpc })

    const taskDef = new ecs.FargateTaskDefinition(this, "MyCoTaskDefinition", {
      memoryLimitMiB: props.memoryLimitMiB || 512,
      cpu: props.cpu || 256,
    });

    //Create ECR repository
    this.ecrRepository = new ecr.Repository(this, 'MyCoRepo', {
      imageScanOnPush: true,
      repositoryName: props.containerName.toLowerCase(),
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    new cdk.CfnOutput(this, 'Output', {
      value: <string>this.ecrRepository.repositoryUri
    })

    const containerDef = new ecs.ContainerDefinition(this, props.containerName, {
      image: ecs.ContainerImage.fromEcrRepository(this.ecrRepository),
      taskDefinition: taskDef,
      logging: new ecs.AwsLogDriver({
        streamPrefix: "ecs",
        logRetention: logs.RetentionDays.ONE_MONTH
      }),

    });
    this.renderContainerDefinition = containerDef.renderContainerDefinition(taskDef)

    containerDef.addPortMappings({
      containerPort: props.containerPort || 3000,
    });

    const albFargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'Service01', {
      cluster: ecsCluster,
      taskDefinition: taskDef,
      enableECSManagedTags: true,
      desiredCount: props.desiredCount || 1,
      domainName: `${props.subDomainName}.${core.zone_name}`,
      domainZone: route53.HostedZone.fromHostedZoneAttributes(this, 'MyCoHostedZone', {
        hostedZoneId: <string>core.hosted_zone_id,
        zoneName: <string>core.zone_name,
      }),
      //certificate: <certificatemanager.ICertificate><unknown>core.zone_cert
    });
    this.albFargateService = albFargateService
    albFargateService.targetGroup.setAttribute('deregistration_delay.timeout_seconds', '30');
    const albFargateServiceResource = albFargateService.service.node.findChild('Service') as ecs.CfnService;
    albFargateServiceResource.addPropertyOverride('PlatformVersion', '1.4.0')

  }

}

export default FargateToEfsStack