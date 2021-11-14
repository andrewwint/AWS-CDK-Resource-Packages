#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { CoreConstruct } from '../index';

const app = new cdk.App();
new CoreConstruct(app, 'CoreStack');
