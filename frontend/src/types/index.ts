export interface User {
  User_ID: string;
  Email: string;
  Role: "manager" | "builder";
  Name: string;
  Surname: string;
  Created_at: string;
}

export interface Project {
  Project_ID: string;
  Name: string;
  Description?: string;
  Budget: number;
  Deadline: string;
  Created_by: string;
  Created_at: string;
}

export interface Task {
  Task_ID: string;
  Project_ID: string;
  Title: string;
  Description?: string;
  User_ID?: string;
  Status: "pending" | "in_progress" | "completed";
  Priority: "low" | "medium" | "high";
  Deadline?: string;
  Photo_path?: string;
  Created_at: string;
}

export interface Item {
  Item_ID: string;
  Cost_ID: string;
  Name?: string;
  Price?: number;
  Quantity?: number;
  Created_at: string;
}

export interface Cost {
  Cost_ID: string;
  Project_ID: string;
  Receipt_ID?: string;
  Amount: number;
  Vendor_name?: string;
  Cost_date: string;
  Category: "materials" | "labor" | "equipment" | "other";
  Created_at: string;
  Items?: Item[];
}

export interface Receipt {
  Receipt_ID: string;
  File_path: string;
  User_ID: string;
  Uploaded_at: string;
}

export interface ReceiptUploadResult {
  receipt: Receipt;
  extracted_data: {
    amount: number | null;
    vendor_name: string | null;
    cost_date: string;
    raw_text: string;
    items: Array<{ name?: string; price?: number; quantity?: number }>;
    success: boolean;
  };
  cost_created: boolean;
  cost_id?: string;
}
