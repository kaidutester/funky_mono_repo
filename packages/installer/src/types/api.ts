import { FlooplanData } from '~/features/pre-configs/types';

export type CustomerConfig = {
  floorplans?: FlooplanData[];
  hoursOfOperation?: any;
  [x: string]: any;
};


// API /customers_list
export interface CustomerListItem {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_config?: CustomerConfig;
}