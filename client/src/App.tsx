import { Switch, Route } from "wouter";
import Dashboard from "@/pages/Dashboard";
import Inventory from "@/pages/Inventory";
import ScanInventory from "@/pages/ScanInventory";
import Suppliers from "@/pages/Suppliers";
import Locations from "@/pages/Locations";
import SalesAnalysis from "@/pages/SalesAnalysis";
import Invoices from "@/pages/Invoices";
import GstReports from "@/pages/GstReports";
import Payments from "@/pages/Payments";
import PriceRevaluation from "@/pages/PriceRevaluation";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/Layout";

function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/scan" component={ScanInventory} />
        <Route path="/suppliers" component={Suppliers} />
        <Route path="/locations" component={Locations} />
        <Route path="/sales" component={SalesAnalysis} />
        <Route path="/invoices" component={Invoices} />
        <Route path="/gst-reports" component={GstReports} />
        <Route path="/payments" component={Payments} />
        <Route path="/price-revaluation" component={PriceRevaluation} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default App;
