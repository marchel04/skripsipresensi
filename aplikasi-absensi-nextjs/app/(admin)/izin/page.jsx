import { Suspense } from "react";
import AdminIzinComponent from "./AdminIzinComponent";

const IzinPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminIzinComponent />
    </Suspense>
  );
};

export default IzinPage;
