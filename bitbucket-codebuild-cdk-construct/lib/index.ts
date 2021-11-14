/**
 *  Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
 *  with the License. A copy of the License is located at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
 *  and limitations under the License.
 */

import * as cdk from '@aws-cdk/core';
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';

export interface BitbucketCodeBuildProps {
    appName: string;
    owner: string,
    repo: string,
    buildSpecFromSourceFilename: string,
    branchOrRef?: string,
    environmentVariables?: {
        [name: string]: codebuild.BuildEnvironmentVariable;
    }
    webhook?: boolean,
    webhookFilters?: codebuild.FilterGroup[],
    s3ArtifactsPath?: string,
    s3ArtifactsName?: string,
    role?: iam.IRole,
}
export class BitbucketCodeBuild extends cdk.Construct {

    public readonly project: codebuild.Project;
    public readonly bucket: s3.Bucket

    constructor(scope: cdk.Construct, id: string, props: BitbucketCodeBuildProps) {
        super(scope, id);

        const bucket = new s3.Bucket(this, 'MyCoBucket', {
            versioned: true
        })

        // Define service role for CodeBuild service
        const serviceRole = iam.Role.fromRoleArn(this,
            "MyCoCoreRole",
            "arn:aws:iam::790768631355:role/MyCoCoreRole");

        this.project = new codebuild.Project(this, 'MyCoCodeBuildProject', {
            role: serviceRole,
            badge: true,
            artifacts: codebuild.Artifacts.s3({
                bucket,
                includeBuildId: false,
                packageZip: true,
                path: props.appName.toLowerCase(),
                name: 'artifact',
            }),
            buildSpec: codebuild.BuildSpec.fromSourceFilename(props.buildSpecFromSourceFilename),
            description: 'Stack Description',
            environment: {
                privileged: true,
                buildImage: codebuild.LinuxBuildImage.STANDARD_3_0,
                computeType: codebuild.ComputeType.SMALL,
                environmentVariables: props.environmentVariables || undefined
            },
            source: codebuild.Source.bitBucket({
                owner: props.owner,
                repo: props.repo,
                branchOrRef: props.branchOrRef || 'master',
                webhook: true,
                webhookFilters: props.webhookFilters
            }),
        });

        new cdk.CfnOutput(this, 'Output', {
            value: <string>this.project.role?.roleArn
        })

        this.bucket = bucket
    }
}

export default BitbucketCodeBuild