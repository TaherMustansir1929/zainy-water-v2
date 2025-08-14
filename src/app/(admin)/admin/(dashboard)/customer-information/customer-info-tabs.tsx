import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable6CustomerInformation } from "./data-table-6-customer-info";
import { GetAllCustomersRecords } from "@/actions/fetch-all-customers.action";
import { CustomerAddForm } from "./customer-add-form";

type Props = {
  data: GetAllCustomersRecords[] | undefined;
};

export const CustomerInfoTabs = ({ data }: Props) => {
  return (
    <Tabs defaultValue="customer_list" className="w-full">
      <TabsList>
        <TabsTrigger value="customer_list">Customer List</TabsTrigger>
        <TabsTrigger value="add_customer">Add Customer</TabsTrigger>
      </TabsList>
      <TabsContent value="customer_list" className="w-full mt-6">
        <DataTable6CustomerInformation data={data} />
      </TabsContent>
      <TabsContent value="add_customer">
        <CustomerAddForm />
      </TabsContent>
    </Tabs>
  );
};
