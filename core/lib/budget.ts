import { Construct } from '@aws-cdk/core';
import * as budgets from '@aws-cdk/aws-budgets';

export interface BudgetProps {

}

export class CoreBudget extends Construct {
  constructor(scope: Construct, id: string, props: BudgetProps) {
    super(scope, id);
    const cfnBudget = new budgets.CfnBudget(this, "MyCoBudget", {
      budget: {
        budgetType: 'COST',
        timeUnit: 'MONTHLY',
        budgetLimit: { amount: 5, unit: "USD" },
      },
      notificationsWithSubscribers: [
        {
          notification: {
            notificationType: "ACTUAL",
            comparisonOperator: "GREATER_THAN",
            threshold: 50
          },
          subscribers: [
            {
              subscriptionType: "EMAIL",
              address: "myemail@example.com"
            }
          ]
        }
      ]
    })

  }
}

export default CoreBudget