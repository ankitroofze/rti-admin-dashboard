import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import Select from "react-select";
import swal from "sweetalert";
import profile from "../assets/images/profile/profile.png";
import avatar1 from "../assets/images/avatar/1.jpg";
import avatar2 from "../assets/images/avatar/2.jpg";
import avatar3 from "../assets/images/avatar/3.jpg";
import AppToast from "../components/common/AppToast";

export const moduleNames = {
  dashboard: "Dashboard",
  "user-profile": "User Profile",
  network: "Network",
  wallets: "Wallet",
  withdrawal: "Withdrawal",
  news: "News",
  "subscription-plan": "Subscription Plan",
  advertisement: "Advertisement",
  "e-paper": "E-Paper",
  quiz: "Quiz",
  "offices-addresses": "Office Address",
  "news-notification": "News Notification",
  "contact-us": "Contact Us",
};

const indianPhonePattern = "[6-9][0-9]{9}";
const pdfUrl =
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

const todayInput = new Date().toISOString().slice(0, 10);
const selectOption = (value) => ({ value, label: value });
const toSelectOptions = (items = []) => items.map(selectOption);

const formatDisplayDate = (value) => {
  if (!value) return "";
  const normalized = String(value).replace("T", " ");
  const looksLikeDate = /\d{4}-\d{1,2}-\d{1,2}|\d{1,2}\s+[A-Za-z]{3,}|\d{1,2}-[A-Za-z]{3,}-\d{4}|[A-Za-z]{3,}\s+\d{1,2}/.test(normalized);
  if (!looksLikeDate && !(value instanceof Date)) return value;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return value;
  const day = String(parsed.getDate()).padStart(2, "0");
  const month = parsed.toLocaleString("en-US", { month: "short" });
  return `${day}-${month}-${parsed.getFullYear()}`;
};

const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const districtMap = {
  Maharashtra: ["Pune", "Mumbai", "Nagpur", "Nashik"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
  "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Siliguri"],
};

const defaultDistricts = ["Central", "North", "South", "East", "West"];
const defaultTalukas = ["Taluka 1", "Taluka 2", "Taluka 3", "Taluka 4"];

const newsCategories = [
  "Politics News", "National News", "International / World News", "Breaking News",
  "Business News", "Finance News", "Economy News", "Stock Market News", "Startup News",
  "Technology News", "AI / Artificial Intelligence News", "Cyber Security News",
  "Science News", "Space News", "Education News", "Exam News", "Government Job News",
  "Sports News", "Cricket News", "Football News", "Entertainment News", "Bollywood News",
  "Hollywood News", "Celebrity News", "OTT / Web Series News", "TV Show News", "Music News",
  "Gaming News", "Mobile & Gadget News", "Automobile News", "Electric Vehicle (EV) News",
  "Health News", "Fitness News", "Medical News", "Lifestyle News", "Fashion News",
  "Beauty News", "Food News", "Travel News", "Tourism News", "Weather News",
  "Environment News", "Climate Change News", "Agriculture News", "Real Estate News",
  "Property News", "Law & Crime News", "Court / Legal News", "Accident News",
  "Disaster News", "Viral News", "Social Media News", "Opinion / Editorial News",
  "Interviews", "Human Interest Stories", "Religion / Spiritual News",
  "Culture & Tradition News", "History News", "Local / City News", "Regional News",
  "State News", "Election News", "Defence / Military News", "Railway News",
  "Aviation News", "Infrastructure News", "Telecom News", "Cryptocurrency News",
  "Insurance News", "Banking News", "NGO / Social Work News", "Women Empowerment News",
  "Child Development News", "Startup Funding News", "Research & Innovation News",
  "Data Privacy News", "Internet Trends News", "Festival News", "Event Coverage News",
  "Documentary / Investigation News", "Other",
];

const users = [
  {
    sr: 1,
    profileId: "USR-1001",
    userId: "USR-1001",
    image: avatar1,
    profile: "Chief Editor",
    name: "Amit Sharma",
    username: "Amit Sharma",
    email: "amit.sharma@example.com",
    phone: "9876543210",
    mobileNumber: "9876543210",
    state: "Maharashtra",
    district: "Pune",
    taluka: "Haveli",
    referralCode: "RTI-AMIT",
    referredBy: "Admin",
    createdDate: "12 May 2026",
    status: "Active",
    userType: "Premium",
    planName: "Premium",
    startDate: "01 May 2026",
    endDate: "01 May 2027",
    subscriptionStatus: "Active",
    bio: "Senior RTI contributor handling public awareness and publishing workflows.",
  },
  {
    sr: 2,
    profileId: "USR-1002",
    userId: "USR-1002",
    image: avatar2,
    profile: "Reporter",
    name: "Priya Verma",
    username: "Priya Verma",
    email: "priya.verma@example.com",
    phone: "9123456789",
    mobileNumber: "9123456789",
    state: "Gujarat",
    district: "Ahmedabad",
    taluka: "Daskroi",
    referralCode: "RTI-PRIYA",
    referredBy: "Amit Sharma",
    createdDate: "10 May 2026",
    status: "Inactive",
    userType: "Free",
    planName: "Basic",
    startDate: "01 Apr 2026",
    endDate: "01 Jul 2026",
    subscriptionStatus: "Inactive",
    bio: "District level reporter profile with verification documents uploaded.",
  },
];

const networkRows = [
  {
    sr: 1,
    userId: "NET-501",
    username: "National Bureau Chief",
    image: avatar3,
    email: "network@example.com",
    phone: "9988776655",
    minimumReferrals: "20",
    commission: "12",
    commissionPercentage: "12%",
    requiredReferrals: "20",
    rewardAmount: "5000",
    bonus: "2500",
    status: "Active",
    createdDate: "09 May 2026",
    bio: "Network rank configured for national referral leadership.",
  },
  {
    sr: 2,
    userId: "NET-502",
    username: "State Coordinator",
    image: avatar1,
    email: "state@example.com",
    phone: "9876501234",
    minimumReferrals: "10",
    commission: "8",
    commissionPercentage: "8%",
    requiredReferrals: "10",
    rewardAmount: "2500",
    bonus: "1000",
    status: "Inactive",
    createdDate: "08 May 2026",
    bio: "Regional network role with referral based commission.",
  },
];

const moduleConfig = {
  dashboard: {
    title: "Dashboard",
    add: false,
    stats: [
      ["Total Users", "2", "fa-users", "primary", "all"],
      ["Active Users", "1", "fa-user-check", "success", "active"],
      ["Inactive Users", "1", "fa-user-xmark", "danger", "inactive"],
      ["Premium Users", "1", "fa-crown", "warning", "premium"],
      ["Newly Added", "1", "fa-user-plus", "info", "new"],
    ],
    filters: ["search", "status", "userType", "state", "district", "taluka"],
    rows: users,
    columns: [
      ["sr", "Sr.No"],
      ["profileId", "Profile ID"],
      ["profileImage", "Profile"],
      ["name", "Name"],
      ["phone", "Phone"],
      ["status", "Status"],
    ],
    actions: ["view", "status", "delete"],
    details: [
      "userId",
      "email",
      "mobileNumber",
      "state",
      "district",
      "referralCode",
      "taluka",
      "referredBy",
      "createdDate",
      "status",
    ],
    profileView: true,
  },
  "user-profile": {
    title: "User Profile",
    add: true,
    filters: ["search", "status", "userType", "state", "district", "taluka"],
    rows: users,
    columns: [
      ["sr", "Sr.No"],
      ["profileId", "Profile ID"],
      ["profileImage", "Profile Image"],
      ["name", "Name"],
      ["phone", "Phone Number"],
      ["status", "Status"],
    ],
    actions: ["view", "status", "delete"],
    details: [
      "userId",
      "email",
      "mobileNumber",
      "state",
      "district",
      "referralCode",
      "taluka",
      "referredBy",
      "createdDate",
      "status",
    ],
    profileView: true,
    form: "user",
  },
  network: {
    title: "Network",
    add: false,
    filters: ["search", "status"],
    rows: networkRows,
    columns: [
      ["sr", "Sr.No"],
      ["userId", "User ID"],
      ["username", "Username"],
      ["minimumReferrals", "Minimum Referrals"],
      ["commission", "Commission (%)"],
      ["status", "Status"],
    ],
    actions: ["view", "status", "delete"],
    details: [
      "userId",
      "username",
      "minimumReferrals",
      "commissionPercentage",
      "status",
      "createdDate",
    ],
    form: "network",
  },
  wallets: {
    title: "Wallet",
    add: false,
    filters: ["search"],
    rows: [
      {
        sr: 1,
        transactionId: "TXN-9001",
        userId: "USR-1001",
        amount: "2500",
        source: "Subscription",
        balanceAfter: "15000",
        createdAt: "13 May 2026",
      },
    ],
    columns: [
      ["sr", "Sr.No"],
      ["transactionId", "Transaction ID"],
      ["userId", "User ID"],
      ["amount", "Amount"],
    ],
    actions: ["view", "delete"],
    details: ["id", "userId", "amount", "source", "balanceAfter", "createdAt"],
  },
  withdrawal: {
    title: "Withdrawal",
    add: false,
    filters: ["search", "status"],
    rows: [
      {
        sr: 1,
        id: "WDR-201",
        transactionId: "WDR-201",
        userId: "USR-1002",
        orderId: "ORD-3001",
        paymentId: "PAY-7788",
        amount: "5000",
        gstAmount: "900",
        totalAmount: "5900",
        paymentMethod: "UPI",
        status: "Approved",
        paidAt: "12 May 2026",
      },
    ],
    columns: [
      ["sr", "Sr.No"],
      ["transactionId", "Transaction ID"],
      ["userId", "User ID"],
      ["orderId", "Order ID"],
      ["paymentId", "Payment ID"],
      ["status", "Status"],
    ],
    actions: ["view", "invoice", "delete"],
    details: [
      "id",
      "userId",
      "orderId",
      "paymentId",
      "amount",
      "gstAmount",
      "totalAmount",
      "paymentMethod",
      "status",
      "paidAt",
    ],
  },
  news: {
    title: "News",
    add: true,
    filters: ["search", "status", "category"],
    rows: [
      {
        sr: 1,
        id: "NEWS-101",
        title: "RTI Awareness Drive",
        author: "Editorial Team",
        status: "Active",
        category: "RTI",
        mediaFile: "news-cover.jpg",
        createdAt: "11 May 2026",
        description: "Awareness article for RTI applicants and journalists.",
      },
    ],
    columns: [
      ["sr", "Sr.No"],
      ["id", "ID"],
      ["title", "Title"],
      ["author", "Author"],
      ["status", "Status"],
      ["category", "Category"],
    ],
    actions: ["view", "update", "delete", "status"],
    details: ["id", "title", "author", "category", "status", "mediaFile", "description", "createdAt"],
    form: "news",
  },
  "subscription-plan": {
    title: "Subscription Plan",
    add: true,
    filters: ["search", "status", "state", "district", "taluka"],
    rows: [
      {
        sr: 1,
        title: "Premium Editorial Plan",
        role: "Chief Editor / Publisher, Executive Editor",
        state: "Maharashtra",
        price: "4999",
        subscriptionStartDate: "01 May 2026",
        subscriptionEndDate: "01 May 2027",
        status: "Active",
      },
    ],
    columns: [
      ["sr", "Sr.No"],
      ["title", "Title"],
      ["role", "Role / पद"],
      ["state", "State"],
      ["status", "Status"],
    ],
    actions: ["view", "update", "delete", "status"],
    details: ["title", "role", "state", "price", "subscriptionStartDate", "subscriptionEndDate", "status"],
    form: "subscription",
  },
  "e-paper": {
    title: "E-Paper",
    add: true,
    filters: ["search"],
    rows: [
      {
        sr: 1,
        id: "EP-501",
        title: "May 2026 Edition",
        pdfFiles: "may-edition.pdf",
        publishDate: "13 May 2026",
        totalPage: "12",
      },
    ],
    columns: [
      ["sr", "Sr.No"],
      ["id", "ID"],
      ["title", "Title"],
      ["pdfFiles", "PDF Files"],
      ["publishDate", "Publish Date"],
    ],
    actions: ["generatePdf", "view", "update", "delete"],
    details: ["id", "title", "pdfFiles", "publishDate", "totalPage"],
    form: "epaper",
  },
  quiz: {
    title: "Quiz",
    add: true,
    filters: ["search", "status", "subject", "difficulty", "testType", "correctAnswer"],
    rows: [
      {
        sr: 1,
        title: "RTI Basics",
        subject: "RTI",
        difficulty: "Easy",
        testType: "Practice (20 Q)",
        marks: "10",
        status: "Active",
        questions: [
          {
            question: "What is the full form of RTI?",
            marks: "5",
            optionA: "Right to Information",
            optionB: "Right to Internet",
            optionC: "Report to India",
            optionD: "Rules to Inform",
            correctAnswer: "A",
            explanation: "RTI stands for Right to Information.",
          },
          {
            question: "Which option is used for an RTI request?",
            marks: "5",
            optionA: "Information request",
            optionB: "Loan request",
            optionC: "Travel request",
            optionD: "Invoice request",
            correctAnswer: "A",
            explanation: "RTI is used to request information from public authorities.",
          },
        ],
        question: "What is the full form of RTI?",
        optionA: "Right to Information",
        optionB: "Right to Internet",
        optionC: "Report to India",
        optionD: "Rules to Inform",
        correctAnswer: "A",
        explanation: "RTI stands for Right to Information.",
      },
    ],
    columns: [
      ["sr", "Sr.No"],
      ["title", "Title"],
      ["subject", "Subject"],
      ["difficulty", "Difficulty"],
      ["testType", "Test Type"],
      ["status", "Status"],
    ],
    actions: ["view", "update", "status", "delete"],
    details: ["title", "subject", "difficulty", "status", "testType", "marks", "question", "optionA", "optionB", "optionC", "optionD", "correctAnswer", "explanation"],
    form: "quiz",
  },
  advertisement: {
    title: "Advertisement",
    add: true,
    filters: ["search", "status"],
    rows: [
      {
        sr: 1,
        id: "AD-301",
        adId: "AD-301",
        product: "RTI Course",
        image: avatar2,
        status: "Active",
        productName: "RTI Course",
        mediaFile: "course-ad.mp4",
        placement: "Home Banner",
        price: "4999",
        offerPrice: "2999",
        startDateTime: "2026-05-13T10:00",
        endDateTime: "2026-06-13T18:00",
        description: "Promotional ad for RTI training course.",
      },
    ],
    columns: [
      ["sr", "Sr.No"],
      ["adId", "Ad ID"],
      ["product", "Product"],
      ["imageThumb", "Image"],
      ["price", "Price"],
      ["offerPrice", "Offer Price"],
      ["status", "Status"],
    ],
    actions: ["view", "update", "status", "delete"],
    details: ["id", "status", "productName", "mediaFile", "placement", "price", "offerPrice", "startDateTime", "endDateTime", "description"],
    form: "ad",
  },
  "offices-addresses": {
    title: "Office Address",
    add: true,
    filters: ["search"],
    rows: [
      {
        sr: 1,
        id: "OFF-001",
        officeName: "Pune Office",
        address: "Shivaji Nagar, Pune",
        phone: "9876543210",
        email: "pune.office@example.com",
        mapLink: "https://maps.google.com",
      },
    ],
    columns: [
      ["sr", "Sr.No"],
      ["id", "ID"],
      ["officeName", "Office Name"],
      ["phone", "Phone"],
      ["email", "Email"],
    ],
    actions: ["view", "update", "delete"],
    details: ["id", "officeName", "address", "phone", "email", "mapLink"],
    form: "office",
  },
  "news-notification": {
    title: "News Notification",
    add: true,
    filters: ["search", "userType"],
    rows: [
      {
        sr: 1,
        id: "NOT-001",
        title: "Breaking News Alert",
        message: "New RTI notification has been published.",
        userType: "Premium Users",
        sentBy: "Admin",
        sentAt: "13 May 2026",
        createdAt: "13 May 2026",
        updatedAt: "13 May 2026",
      },
    ],
    columns: [
      ["sr", "Sr.No"],
      ["id", "ID"],
      ["title", "Title"],
      ["userType", "User Type"],
      ["sentBy", "Sent By"],
      ["sentAt", "Sent At"],
    ],
    actions: ["view", "send", "delete"],
    details: ["id", "title", "message", "userType", "sentBy", "sentAt", "createdAt", "updatedAt"],
    form: "notification",
  },
  "contact-us": {
    title: "Contact Us",
    add: false,
    filters: ["search"],
    rows: [
      {
        sr: 1,
        id: "CON-001",
        name: "Rahul Patil",
        email: "rahul.patil@example.com",
        phone: "9876543210",
        message: "Please share RTI membership information.",
        createdAt: "13 May 2026",
      },
    ],
    columns: [
      ["sr", "Sr.No"],
      ["id", "ID"],
      ["name", "Name"],
      ["email", "Email"],
      ["phone", "Phone"],
    ],
    actions: ["view", "delete"],
    details: ["id", "name", "email", "phone", "message", "createdAt"],
  },
};

const labels = {
  id: "ID",
  userId: "User ID",
  profileId: "Profile ID",
  email: "Email",
  mobileNumber: "Mobile Number",
  phone: "Phone",
  state: "State",
  district: "District",
  taluka: "Taluka",
  referralCode: "Referral Code",
  referredBy: "Referred By",
  createdDate: "Created Date",
  status: "Status",
  username: "Username",
  minimumReferrals: "Minimum Referrals",
  commissionPercentage: "Commission Percentage",
  title: "Title",
  author: "Author",
  category: "Category",
  mediaFile: "Media File",
  description: "Description",
  createdAt: "Created At",
  updatedAt: "Updated At",
  role: "Role / पद",
  price: "Price (₹)",
  subscriptionStartDate: "Subscription Start Date",
  subscriptionEndDate: "Subscription End Date",
  pdfFiles: "PDF Files",
  publishDate: "Publish Date",
  totalPage: "Total Page",
  subject: "Subject",
  difficulty: "Difficulty",
  testType: "Test Type",
  tags: "Tags",
  question: "Question",
  optionA: "Option A",
  optionB: "Option B",
  optionC: "Option C",
  optionD: "Option D",
  correctAnswer: "Correct Answer",
  explanation: "Explanation",
  marks: "Marks",
  adId: "Ad ID",
  productName: "Product Name",
  placement: "Placement",
  offerPrice: "Offer Price (₹)",
  startDateTime: "Start Date & Time",
  endDateTime: "End Date & Time",
  officeName: "Office Name",
  address: "Address",
  mapLink: "Map Link",
  message: "Message",
  userType: "User Type",
  sentBy: "Sent By",
  sentAt: "Sent At",
  transactionId: "Transaction ID",
  amount: "Amount",
  source: "Source",
  balanceAfter: "Balance After",
  orderId: "Order ID",
  paymentId: "Payment ID",
  gstAmount: "GST Amount",
  totalAmount: "Total Amount",
  paymentMethod: "Payment Method",
  paidAt: "Paid At",
};

const getConfig = (slug) => moduleConfig[slug] || moduleConfig.dashboard;

const storageKey = (slug) => `rti-module-${slug}`;

const getStoredRows = (slug) => {
  try {
    const rows = JSON.parse(localStorage.getItem(storageKey(slug)) || "[]");
    return Array.isArray(rows) ? rows.filter((row) => row && typeof row === "object") : [];
  } catch {
    return [];
  }
};

const saveStoredRows = (slug, rows) => {
  localStorage.setItem(storageKey(slug), JSON.stringify(rows));
};

const getRows = (slug) => [...getStoredRows(slug), ...(getConfig(slug).rows || [])].filter((row) => row && typeof row === "object");
const firstRow = (slug) => getRows(slug)[0] || {};

const pickRecordTitle = (row) => {
  const record = row || {};
  return record.name || record.username || record.title || record.productName || record.officeName || record.userId || record.transactionId || record.id || "this record";
};

const pickRecordSubTitle = (row) => {
  const record = row || {};
  return record.email || record.phone || record.orderId || record.transactionId || record.userType || record.category || record.amount || "";
};

const isPositiveStatus = (status) => ["Active", "Approved", "Paid"].includes(status);

const statusBadge = (status) => (
  <span className={`badge light badge-${isPositiveStatus(status) ? "success" : status === "Pending" ? "warning" : "danger"}`}>
    {status || "Active"}
  </span>
);

const StatusToggle = ({ active = true, onClick = () => {} }) => (
  <button
    type="button"
    className={`rti-status-toggle ${active ? "active" : "inactive"}`}
    onClick={onClick}
  >
    <span />
    {active ? "Active" : "Inactive"}
  </button>
);

const PageHeading = ({ title, children }) => (
  <div className="d-flex align-items-center gap-3 flex-wrap mb-4">
    {children}
    <div>
      <h3 className="mb-1">{title}</h3>
    </div>
  </div>
);

const FilterBar = ({ filters = [], values, onChange }) => {
  if (!filters.length) return null;
  const selectFilters = {
    state: ["State", states],
    district: ["District", districtMap.Maharashtra || defaultDistricts],
    taluka: ["Taluka", defaultTalukas],
    status: ["Status", ["Active", "Inactive", "Approved", "Failed", "Pending"]],
    filterStatus: ["Filter Status", ["Active", "Inactive", "Approved", "Failed", "Pending"]],
    category: ["Category", newsCategories],
    subject: ["Subject", ["RTI", "BNS", "Journalism"]],
    difficulty: ["Difficulty", ["Easy", "Medium", "Hard"]],
    testType: ["Test Type", ["Practice (20 Q)", "Training (50 Q)", "Exam (100 Q)"]],
    correctAnswer: ["Correct Answer", ["A", "B", "C", "D"]],
    userType: ["User Type", ["Free", "Premium", "All Users", "Premium Users", "Inactive Users"]],
  };

  return (
    <div className="rti-table-filters">
      <div className="row g-3">
        {filters.includes("search") && (
          <div className="col-xl-3 col-md-6">
            <input className="form-control" type="search" placeholder="Search..." value={values.search} onChange={(event) => onChange("search", event.target.value)} />
          </div>
        )}
        {Object.entries(selectFilters).map(([name, [label, options]]) => filters.includes(name) && (
          <div className="col-xl-3 col-md-6" key={name}>
            <div className="card-body Cms-selecter p-0">
              <label className="from-label">{label}</label>
              <Select
                options={toSelectOptions(options)}
                className="custom-react-select"
                classNamePrefix="rti-react-select"
                isClearable
                placeholder={label}
                value={values[name] ? selectOption(values[name]) : null}
                onChange={(option) => onChange(name, option?.value || "")}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DashboardCards = ({ stats = [], selected = "all", onSelect }) => (
  <div className="row rti-dashboard-cards">
    {stats.map(([label, value, icon, color, key]) => (
      <div className="col" key={label}>
        <button type="button" className={`card avtivity-card w-100 text-start ${selected === key ? "rti-card-active" : ""}`} onClick={() => onSelect(key)}>
          <div className="card-body">
            <div className="media align-items-center">
              <span className={`activity-icon bgl-${color} me-md-4 me-3`}>
                <i className={`fa ${icon} text-${color} fs-24`} />
              </span>
              <div className="media-body">
                <p className="fs-14 mb-2">{label}</p>
                <span className="title text-black font-w600">{value}</span>
              </div>
            </div>
          </div>
          <div className={`effect bg-${color}`} />
        </button>
      </div>
    ))}
  </div>
);

const ActionButtons = ({ slug, actions, row, onDelete, onStatus }) => (
  <div className="rti-action-buttons">
    {actions.includes("generatePdf") && (
      <a href={pdfUrl} target="_blank" rel="noreferrer" className="btn btn-secondary shadow btn-xs sharp">
        <i className="fa fa-file-pdf" />
      </a>
    )}
    {actions.includes("view") && (
      <Link to={`/admin/${slug}/view`} className="btn btn-info shadow btn-xs sharp">
        <i className="fa fa-eye" />
      </Link>
    )}
    {actions.includes("update") && (
      <Link to={`/admin/${slug}/update`} className="btn btn-primary shadow btn-xs sharp">
        <i className="fas fa-pen" />
      </Link>
    )}
    {actions.includes("invoice") && (
      <button type="button" onClick={() => window.print()} className="btn btn-secondary shadow btn-xs sharp">
        <i className="fa fa-print" />
      </button>
    )}
    {actions.includes("send") && (
      <button
        type="button"
        onClick={() => navigator.share?.({ title: "News Notification", text: "Notification sent" })}
        className="btn btn-success shadow btn-xs sharp"
      >
        <i className="fa fa-paper-plane" />
      </button>
    )}
    {actions.includes("status") && (
      <button type="button" onClick={() => onStatus(row)} className={`btn shadow btn-xs sharp ${isPositiveStatus(row.status || "Active") ? "btn-success" : "btn-danger"}`}>
        <i className={`fa ${isPositiveStatus(row.status || "Active") ? "fa-toggle-on" : "fa-toggle-off"}`} />
      </button>
    )}
    {actions.includes("delete") && (
      <button type="button" onClick={() => onDelete(row)} className="btn btn-danger shadow btn-xs sharp">
        <i className="fa fa-trash" />
      </button>
    )}
  </div>
);

const CellValue = ({ field, row, slug, onImage }) => {
  if (field === "profileImage") {
    return <button type="button" className="rti-image-button" onClick={() => onImage(row.image || profile)}><img src={row.image || profile} alt={row.name} className="rounded-circle" width="38" height="38" /></button>;
  }
  if (field === "imageThumb") {
    return <button type="button" className="rti-image-button" onClick={() => onImage(row.image || profile)}><img src={row.image || profile} alt={row.product} className="rounded" width="44" height="34" /></button>;
  }
  if (field === "status") return statusBadge(row.status);
  if (field === "pdfFiles") {
    return (
      <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-primary">
        <i className="fa fa-file-pdf me-1" />
        {row.pdfFiles}
      </a>
    );
  }
  const value = row[field] || "-";
  const text = formatDisplayDate(value) || value;
  if (typeof text === "string" && text.length > 24) {
    return (
      <Link to={`/admin/${slug}/view`} className="rti-truncate-link" title={text}>
        {text}
      </Link>
    );
  }
  return text;
};

const ConfirmModal = ({ show, title, message, intent = "status", confirmText = "Yes", onHide, onConfirm }) => {
  React.useEffect(() => {
    if (!show) return;
    swal({
      title,
      text: intent === "delete" ? `${message} This record will be removed from the list.` : message,
      icon: intent === "delete" ? "warning" : "info",
      buttons: ["No", confirmText],
      dangerMode: intent === "delete",
    }).then((confirmed) => {
      if (confirmed) {
        onConfirm();
      } else {
        onHide();
      }
    });
  }, [confirmText, intent, message, onConfirm, onHide, show, title]);

  return null;
};

const ImageModal = ({ image, onHide }) => (
  <Modal show={Boolean(image)} onHide={onHide} centered>
    <Modal.Body className="text-center">
      <img src={image} alt="Preview" className="rti-preview-image" />
    </Modal.Body>
  </Modal>
);

export const ModuleList = ({ slug }) => {
  const config = getConfig(slug);
  const [moduleRows, setModuleRows] = useState(() => getRows(slug));
  const [filters, setFilters] = useState({
    search: "",
    profileId: "",
    name: "",
    phone: "",
    status: "",
    userType: "",
    subject: "",
    difficulty: "",
    category: "",
    correctAnswer: "",
    filterStatus: "",
    id: "",
    userId: "",
    username: "",
    transactionId: "",
    amount: "",
    orderId: "",
    title: "",
    author: "",
    role: "",
    state: "",
    adId: "",
    product: "",
    officeName: "",
    email: "",
    publishDate: "",
    testType: "",
    taluka: "",
    district: "",
  });
  const [cardFilter, setCardFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteRow, setDeleteRow] = useState(null);
  const [statusRow, setStatusRow] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [toast, setToast] = useState(() => {
    const message = sessionStorage.getItem("moduleToast");
    if (message) {
      sessionStorage.removeItem("moduleToast");
    }
    return message || "";
  });

  const filteredRows = useMemo(() => {
    const sourceRows = [...moduleRows];
    return sourceRows.filter((row) => {
      const haystack = Object.values(row).join(" ").toLowerCase();
      if (cardFilter === "active" && row.status !== "Active") return false;
      if (cardFilter === "inactive" && row.status !== "Inactive") return false;
      if (cardFilter === "premium" && row.userType !== "Premium") return false;
      if (cardFilter === "new" && !String(row.createdDate || row.createdAt || "").includes("13 May 2026")) return false;
      if (filters.search && !haystack.includes(filters.search.toLowerCase())) return false;
      if (filters.profileId && !String(row.profileId || "").toLowerCase().includes(filters.profileId.toLowerCase())) return false;
      if (filters.name && !String(row.name || row.username || "").toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.phone && !String(row.phone || row.mobileNumber || "").includes(filters.phone)) return false;
      if (filters.status && row.status !== filters.status) return false;
      if (filters.filterStatus && row.status !== filters.filterStatus) return false;
      if (filters.userType && row.userType !== filters.userType) return false;
      if (filters.subject && row.subject !== filters.subject) return false;
      if (filters.difficulty && row.difficulty !== filters.difficulty) return false;
      if (filters.category && row.category !== filters.category) return false;
      if (filters.correctAnswer && row.correctAnswer !== filters.correctAnswer && !(row.questions || []).some((question) => question.correctAnswer === filters.correctAnswer)) return false;
      const directFilters = ["id", "userId", "username", "transactionId", "amount", "orderId", "title", "author", "role", "state", "district", "taluka", "adId", "product", "officeName", "email", "publishDate", "testType"];
      if (directFilters.some((field) => filters[field] && !String(row[field] || "").toLowerCase().includes(filters[field].toLowerCase()))) return false;
      return true;
    });
  }, [cardFilter, moduleRows, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / 10));
  const rows = filteredRows.slice((page - 1) * 10, page * 10);
  const onFilterChange = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setPage(1);
  };

  const addLabel =
    slug === "user-profile" ? "Add User" :
    slug === "news" ? "Add News" :
    slug === "advertisement" ? "Add Advertisement" :
    slug === "offices-addresses" ? "Add Office Address" :
    slug === "e-paper" ? "Add E-Paper" :
    slug === "subscription-plan" ? "Add Subscription" :
    slug === "quiz" ? "Add Quiz" :
    slug === "news-notification" ? "Add Notification" :
    "Add";

  return (
    <div className="row">
      <div className="col-12">
        <PageHeading title={config.title} />
      </div>
      <AppToast show={Boolean(toast)} message={toast} onClose={() => setToast("")} />
      {config.stats && <DashboardCards stats={config.stats} selected={cardFilter} onSelect={setCardFilter} />}
      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
            <h4 className="card-title mb-0">{config.title} List</h4>
            {config.add && (
              <Link to={`/admin/${slug}/add`} className="btn btn-primary btn-sm">
                <i className="fa fa-plus me-2" />
                {addLabel}
              </Link>
            )}
          </div>
          <div className="card-body">
            <FilterBar filters={config.filters} values={filters} onChange={onFilterChange} />
            <div className="table-responsive rti-desktop-table">
              <table className="table table-responsive-md">
                <thead>
                  <tr>
                    {config.columns.map(([, label]) => (
                      <th key={label}>{label}</th>
                    ))}
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => {
                    const displayRow = { ...row, sr: (page - 1) * 10 + rowIndex + 1 };
                    return (
                    <tr key={`${slug}-${row.sr || row.id}`}>
                      {config.columns.map(([field]) => (
                        <td key={field}>
                          <CellValue field={field} row={displayRow} slug={slug} onImage={setImagePreview} />
                        </td>
                      ))}
                      <td>
                        <ActionButtons slug={slug} actions={config.actions} row={row} onDelete={setDeleteRow} onStatus={setStatusRow} />
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="rti-mobile-table">
              {rows.map((row) => (
                <div className="card border mb-2" key={`mobile-${slug}-${row.sr || row.id}`}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between gap-2">
                      <strong>{row.name || row.username || row.title || row.productName || row.id}</strong>
                      {row.status && statusBadge(row.status)}
                    </div>
                    <p className="mb-1">{row.profileId || row.userId || row.transactionId || row.id}</p>
                    <p className="mb-3">{row.phone || row.email || row.category || row.amount || row.createdAt}</p>
                    <ActionButtons slug={slug} actions={config.actions} row={row} onDelete={setDeleteRow} onStatus={setStatusRow} />
                  </div>
                </div>
              ))}
            </div>
            <nav className="mt-3 d-flex justify-content-center">
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button className="page-link" type="button" onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
                </li>
                {Array.from({ length: totalPages }, (_, index) => (
                  <li className={`page-item ${page === index + 1 ? "active" : ""}`} key={index + 1}>
                    <button className="page-link" type="button" onClick={() => setPage(index + 1)}>{index + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
      <ConfirmModal
        show={Boolean(deleteRow)}
        title="Delete Confirmation"
        row={deleteRow}
        intent="delete"
        message={`Are you sure you want to delete ${pickRecordTitle(deleteRow)}?`}
        confirmText="Delete"
        variant="danger"
        onHide={() => setDeleteRow(null)}
        onConfirm={() => {
          const nextRows = moduleRows.filter((item) => item !== deleteRow);
          setModuleRows(nextRows);
          saveStoredRows(slug, nextRows.filter((item) => item._local));
          setDeleteRow(null);
          setToast(`${pickRecordTitle(deleteRow)} deleted successfully`);
        }}
      />
      <ConfirmModal
        show={Boolean(statusRow)}
        title="Status Confirmation"
        row={statusRow}
        message={`Do you want to change ${pickRecordTitle(statusRow)} from ${statusRow?.status || "Active"} to ${isPositiveStatus(statusRow?.status || "Active") ? "Inactive" : "Active"}?`}
        confirmText="Yes"
        onHide={() => setStatusRow(null)}
        onConfirm={() => {
          const nextRows = moduleRows.map((item) => item === statusRow ? { ...item, status: isPositiveStatus(item.status || "Active") ? "Inactive" : "Active" } : item);
          setModuleRows(nextRows);
          saveStoredRows(slug, nextRows.filter((item) => item._local));
          setStatusRow(null);
          setToast(`${pickRecordTitle(statusRow)} status updated successfully`);
        }}
      />
      <ImageModal image={imagePreview} onHide={() => setImagePreview("")} />
    </div>
  );
};

const DetailGrid = ({ fields, row, onStatus }) => (
  <div className="row">
    {fields.map((field) => (
      <div className={field === "description" || field === "bio" || field === "message" ? "col-12" : "col-xl-6"} key={field}>
        <div className="border-bottom py-3">
          <small className="text-muted d-block">{labels[field] || field}</small>
          <strong>
            {field === "status" ? <StatusToggle active={isPositiveStatus(row[field] || "Active")} onClick={onStatus} /> : field === "pdfFiles" || field.toLowerCase().includes("pdf") ? (
              <a href={pdfUrl} target="_blank" rel="noreferrer">
                <i className="fa fa-file-pdf me-1" />
                {row[field] || labels[field]}
              </a>
            ) : (
              row[field] || "-"
            )}
          </strong>
        </div>
      </div>
    ))}
  </div>
);

const ProfileDetailLayout = ({ row, config, onImage, onStatus }) => (
  <div className="row">
    <div className="col-xl-4">
      <div className="card">
        <div className="card-body text-center">
          <button type="button" className="rti-image-button" onClick={() => onImage(row.image || profile)}>
            <img src={row.image || profile} alt={row.name || row.username} className="rounded-circle mb-3" width="110" height="110" />
          </button>
          <h4>{row.name || row.username}</h4>
          <p className="mb-2">{row.profileId || row.userId}</p>
        </div>
      </div>
    </div>
    <div className="col-xl-8">
      <div className="card">
        <div className="card-header d-flex justify-content-between">
          <h4 className="card-title mb-0">{config.profileView ? "Profile Details" : "Network Details"}</h4>
        </div>
        <div className="card-body">
          <DetailGrid fields={config.details} row={row} onStatus={onStatus} />
          {config.profileView && (
            <div className="row mt-3">
              <div className="col-xl-6">
                <h5>Subscription Plan</h5>
                <p><strong>Plan Name:</strong> {row.planName}</p>
                <p><strong>Start Date:</strong> {row.startDate}</p>
                <p><strong>End Date:</strong> {row.endDate}</p>
                <p><strong>Status:</strong> {statusBadge(row.subscriptionStatus)}</p>
              </div>
              <div className="col-xl-6">
                <h5>Documents</h5>
                <div className="d-flex flex-wrap gap-2">
                  {["User ID PDF", "Certification PDF", "Appointment Letter PDF"].map((doc) => (
                    <a href={pdfUrl} target="_blank" rel="noreferrer" className="btn btn-outline-primary btn-sm" key={doc}>
                      <i className="fa fa-file-pdf me-2" />
                      {doc}
                    </a>
                  ))}
                </div>
              </div>
              <div className="col-12 mt-3">
                <h5>Bio</h5>
                <p className="mb-0">{row.bio}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const WithdrawalInvoice = ({ row }) => (
  <div className="card rti-invoice mb-4">
    <div className="card-body">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 border-bottom pb-3 mb-3">
        <div className="d-flex align-items-center gap-3">
          <img src={profile} alt="RTI Bharati Mahiti Adhikar" />
          <div>
            <h4 className="mb-1">RTI Bharati Mahiti Adhikar</h4>
            <p className="mb-0 text-muted">Withdrawal Invoice</p>
          </div>
        </div>
        <strong>{row.transactionId}</strong>
      </div>
      <DetailGrid fields={["userId", "orderId", "transactionId", "amount", "gstAmount", "totalAmount", "paymentMethod", "status", "paidAt"]} row={row} />
    </div>
  </div>
);

const QuizDetail = ({ row, editable = false }) => {
  const [expanded, setExpanded] = useState(false);
  const questions = row.questions?.length ? row.questions : [{
    question: row.question,
    marks: row.marks,
    optionA: row.optionA,
    optionB: row.optionB,
    optionC: row.optionC,
    optionD: row.optionD,
    correctAnswer: row.correctAnswer,
    explanation: row.explanation,
  }];
  const visibleQuestions = expanded ? questions : questions.slice(0, 1);

  return (
    <div className="card rti-quiz-view">
      <div className="card-header">
        <h4 className="card-title mb-0">Questions</h4>
      </div>
      <div className="card-body">
        <div className="row mb-3">
          <div className="col-md-3"><strong>Subject:</strong> {row.subject || "-"}</div>
          <div className="col-md-3"><strong>Difficulty:</strong> {row.difficulty || "-"}</div>
          <div className="col-md-3"><strong>Test Type:</strong> {row.testType || "-"}</div>
          <div className="col-md-3"><strong>Status:</strong> {statusBadge(row.status)}</div>
        </div>
        {visibleQuestions.map((question, index) => (
          <div className="rti-question-card" key={`${question.question}-${index}`}>
            <div className="d-flex align-items-start justify-content-between gap-3">
              <h5 className="mb-3">Q{index + 1}. {question.question || "-"}</h5>
              <span className="badge light badge-primary">{question.marks || 0} Marks</span>
            </div>
            <div className="row g-2">
              {["optionA", "optionB", "optionC", "optionD"].map((optionKey, optionIndex) => {
                const optionLetter = ["A", "B", "C", "D"][optionIndex];
                const isCorrect = question.correctAnswer === optionLetter;
                return (
                  <div className="col-md-6" key={optionKey}>
                    <div className={`rti-option ${isCorrect ? "is-correct" : ""}`}>
                      <strong>{optionLetter}.</strong> {question[optionKey] || "-"}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mb-0 mt-3"><strong>Explanation:</strong> {question.explanation || "-"}</p>
            {editable && (
              <div className="mt-3 d-flex gap-2">
                <Link to="/admin/quiz/update" className="btn btn-primary btn-sm"><i className="fa fa-pen me-1" />Edit</Link>
                <Link to="/admin/quiz/deleted" className="btn btn-danger btn-sm"><i className="fa fa-trash me-1" />Delete</Link>
              </div>
            )}
          </div>
        ))}
        {questions.length > 1 && (
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setExpanded((value) => !value)}>
            {expanded ? "View Less" : `View More (${questions.length - 1})`}
          </button>
        )}
      </div>
    </div>
  );
};

export const ModuleView = ({ slug }) => {
  const config = getConfig(slug);
  const [row, setRow] = useState(() => firstRow(slug));
  const [imagePreview, setImagePreview] = useState("");
  const [confirmStatus, setConfirmStatus] = useState(false);
  const [toast, setToast] = useState("");

  return (
    <>
      <AppToast show={Boolean(toast)} message={toast} onClose={() => setToast("")} />
      <div className="d-flex align-items-center gap-3 flex-wrap mb-4">
        <Link to={`/admin/${slug}`} className="btn btn-light">
          <i className="fa fa-arrow-left me-2" />
          Back
        </Link>
        <h3 className="mb-0">{config.title} Details</h3>
      </div>
      {slug === "quiz" ? (
        <QuizDetail row={row} />
      ) : config.profileView || slug === "network" ? (
        <ProfileDetailLayout row={row} config={config} onImage={setImagePreview} onStatus={() => setConfirmStatus(true)} />
      ) : (
        <>
        {slug === "withdrawal" && <WithdrawalInvoice row={row} />}
        <div className="card">
          <div className="card-header d-flex justify-content-between">
            <h4 className="card-title mb-0">{config.title} Details</h4>
            {slug === "withdrawal" && (
              <button type="button" className="btn btn-primary btn-sm" onClick={() => window.print()}>
                <i className="fa fa-print me-1" />
                Open Invoice
              </button>
            )}
          </div>
          <div className="card-body">
            {row.image && (
              <button type="button" className="rti-image-button mb-3" onClick={() => setImagePreview(row.image || profile)}>
                <img src={row.image || profile} alt={pickRecordTitle(row)} className="rti-detail-image" />
              </button>
            )}
            <DetailGrid fields={config.details} row={row} onStatus={() => setConfirmStatus(true)} />
          </div>
        </div>
        </>
      )}
      <ConfirmModal
        show={confirmStatus}
        title="Status Confirmation"
        row={row}
        message={`Do you want to change ${pickRecordTitle(row)} from ${row.status || "Active"} to ${isPositiveStatus(row.status || "Active") ? "Inactive" : "Active"}?`}
        onHide={() => setConfirmStatus(false)}
        onConfirm={() => {
          setRow((current) => ({ ...current, status: isPositiveStatus(current.status || "Active") ? "Inactive" : "Active" }));
          setConfirmStatus(false);
          setToast(`${pickRecordTitle(row)} status updated successfully`);
        }}
      />
      <ImageModal image={imagePreview} onHide={() => setImagePreview("")} />
    </>
  );
};

const Field = ({ label, name, type = "text", as = "input", options, multiple = false, required = true, readOnly = false, accept }) => {
  const [selected, setSelected] = useState(multiple ? [] : null);
  const dateLike = type === "date" || type === "datetime-local";
  const hiddenValue = multiple ? selected.map((option) => option.value).join(", ") : selected?.value || "";

  return (
    <div className="form-group mb-3 row">
      <label className="col-lg-4 col-form-label" htmlFor={name}>
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <div className="col-lg-8">
        {as === "select" ? (
          <div className="card-body Cms-selecter p-0">
            <label className="from-label visually-hidden">{label}</label>
            <Select
              options={toSelectOptions(options)}
              className="custom-react-select"
              classNamePrefix="rti-react-select"
              isClearable
              isMulti={multiple}
              placeholder={label}
              value={selected}
              onChange={(value) => setSelected(value || (multiple ? [] : null))}
            />
            <input type="hidden" id={name} name={name} value={hiddenValue} />
          </div>
        ) : as === "textarea" ? (
          <textarea className="form-control" id={name} name={name} rows="5" placeholder={label} defaultValue="" />
        ) : (
          <input
            type={dateLike ? "text" : type}
            className="form-control"
            id={name}
            name={name}
            placeholder={dateLike ? "08-May-2026" : label}
            readOnly={readOnly}
            accept={accept}
            pattern={type === "tel" ? indianPhonePattern : undefined}
            maxLength={type === "tel" ? 10 : undefined}
            min={type === "date" ? todayInput : undefined}
            required={required}
            onBlur={dateLike ? (event) => {
              event.currentTarget.value = formatDisplayDate(event.currentTarget.value) || event.currentTarget.value;
            } : undefined}
            onInput={type === "tel" ? (event) => {
              event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "").slice(0, 10);
            } : undefined}
          />
        )}
      </div>
    </div>
  );
};

const makeRecordFromForm = (slug, config, form) => {
  const formData = new FormData(form);
  const data = Object.fromEntries(Array.from(formData.entries()).map(([key, value]) => [key, value instanceof File ? value.name : value]));
  const now = formatDisplayDate(new Date());
  const generatedId = `${slug.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-5)}`;
  const questionNumbers = Array.from(form.querySelectorAll("[data-question-number]")).map((node) => node.dataset.questionNumber);
  const questions = questionNumbers.map((item) => ({
    question: data[`question-${item}`] || "",
    marks: data[`marks-${item}`] || "",
    optionA: data[`option-a-${item}`] || "",
    optionB: data[`option-b-${item}`] || "",
    optionC: data[`option-c-${item}`] || "",
    optionD: data[`option-d-${item}`] || "",
    correctAnswer: data[`correct-${item}`] || "",
    explanation: data[`explanation-${item}`] || "",
  })).filter((question) => question.question);

  return {
    _local: true,
    sr: Date.now(),
    id: data.id || data["news-id"] || data["epaper-id"] || data["ad-id"] || data["office-id"] || generatedId,
    userId: data["user-id"] || data["rank-user-id"] || generatedId,
    profileId: data["user-id"] || generatedId,
    transactionId: data["transaction-id"] || generatedId,
    orderId: data["order-id"] || "",
    name: data["full-name"] || data.name || data.title || "New Record",
    username: data.username || data["full-name"] || data.title || "New Record",
    title: data.title || data["full-name"] || "New Record",
    author: data.author || "",
    email: data.email || "",
    phone: data.phone || data["mobile-number"] || "",
    mobileNumber: data["mobile-number"] || data.phone || "",
    image: ["user", "ad"].includes(config.form) ? profile : undefined,
    state: data.state || "",
    district: data.district || "",
    taluka: data.taluka || "",
    role: data.role || "",
    category: data.category || "",
    subject: data.subject || "",
    difficulty: data.difficulty || "",
    testType: data["test-types"] || "",
    product: data["product-name"] || "",
    productName: data["product-name"] || "",
    officeName: data["office-name"] || "",
    address: data.address || "",
    userType: data["user-type"] || "",
    mediaFile: data["media-file"] || "",
    pdfFiles: data["pdf-files"] || "",
    publishDate: formatDisplayDate(data["publish-date"]) || "",
    totalPage: data["total-page"] || "",
    amount: data.amount || data.price || "",
    price: data.price || "",
    offerPrice: data["offer-price"] || "",
    message: data.message || "",
    description: data.description || data.bio || "",
    bio: data.bio || data.description || "",
    status: data.status || "Active",
    questions,
    question: questions[0]?.question || data.question || "",
    optionA: questions[0]?.optionA || data.optionA || "",
    optionB: questions[0]?.optionB || data.optionB || "",
    optionC: questions[0]?.optionC || data.optionC || "",
    optionD: questions[0]?.optionD || data.optionD || "",
    correctAnswer: questions[0]?.correctAnswer || data.correctAnswer || "",
    explanation: questions[0]?.explanation || data.explanation || "",
    marks: data.marks || questions.reduce((total, item) => total + Number(item.marks || 0), 0) || "",
    startDate: formatDisplayDate(data["start-date"]) || "",
    endDate: formatDisplayDate(data["end-date"]) || "",
    subscriptionStartDate: formatDisplayDate(data["start-date"]) || "",
    subscriptionEndDate: formatDisplayDate(data["end-date"]) || "",
    startDateTime: formatDisplayDate(data["start-date-time"]) || "",
    endDateTime: formatDisplayDate(data["end-date-time"]) || "",
    sentAt: formatDisplayDate(data["sent-at"]) || "",
    createdDate: now,
    createdAt: formatDisplayDate(data["created-at"]) || now,
    updatedAt: formatDisplayDate(data["updated-at"]) || now,
  };
};

const ImageUpload = ({ title = "Profile Image Upload" }) => {
  const [file, setFile] = useState();
  const preview = file ? URL.createObjectURL(file) : profile;

  return (
    <div className="form-group mb-3 row">
      <label className="col-lg-4 col-form-label">{title}</label>
      <div className="col-lg-8">
        <div className="avatar-upload d-flex align-items-center">
          <div className="position-relative">
            <div className="avatar-preview">
              <div id="imagePreview" style={{ backgroundImage: `url(${preview})` }} />
            </div>
            <div className="change-btn d-flex align-items-center flex-wrap">
              <input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0])} id="imageUpload" className="form-control d-none" />
              <label htmlFor="imageUpload" className="btn btn-light ms-0">Select Image</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FileUpload = ({ label, accept = ".pdf,image/*,video/*", required = true }) => (
  <Field label={label} name={label.toLowerCase().replaceAll(" ", "-")} type="file" accept={accept} required={required} />
);

const formFields = {
  user: [
    ["User ID", "user-id"],
    ["Full Name", "full-name"],
    ["Email Address", "email", "email"],
    ["Mobile Number", "mobile-number", "tel"],
    ["States", "state", "select", states],
    ["District", "district", "select", districtMap.Maharashtra || defaultDistricts],
    ["Taluka", "taluka", "select", defaultTalukas],
    ["Status", "status", "select", ["Active", "Inactive"]],
  ],
  network: [
    ["Rank/User ID", "rank-user-id"],
    ["Rank Name / Username", "username"],
    ["Required Referrals", "required-referrals", "number"],
    ["Commission Percentage", "commission-percentage", "number"],
    ["Reward Amount", "reward-amount", "number"],
    ["Bonus", "bonus", "number"],
    ["Status", "status", "select", ["Active", "Inactive"]],
  ],
  news: [
    ["News ID", "news-id"],
    ["Title", "title"],
    ["Author", "author"],
    ["Category", "category", "select", newsCategories],
    ["Status", "status", "select", ["Active", "Inactive"]],
    ["Media File", "media-file", "file"],
    ["Created At", "created-at", "date"],
    ["Description", "description", "textarea"],
  ],
  subscription: [
    ["Title", "title"],
    ["Roles", "role", "select-multiple", ["Chief Editor / Publisher", "Executive Editor", "Deputy Editor (National)", "Public Relations Officer (PRO)", "National Bureau Chief", "Pratinidhi"]],
    ["State", "state", "select", states],
    ["District", "district", "select", districtMap.Maharashtra || defaultDistricts],
    ["Taluka", "taluka", "select", defaultTalukas],
    ["Price", "price", "number"],
    ["Subscription Start Date", "start-date", "date"],
    ["Subscription End Date", "end-date", "date"],
    ["Status", "status", "select", ["Active", "Inactive"]],
  ],
  epaper: [
    ["E-Paper ID", "epaper-id"],
    ["Title", "title"],
    ["PDF Files", "pdf-files", "file"],
    ["Publish Date", "publish-date", "date"],
    ["Total Page", "total-page", "number"],
  ],
  ad: [
    ["ID", "ad-id"],
    ["Status", "status", "select", ["Active", "Inactive"]],
    ["Product Name", "product-name"],
    ["Media File", "media-file", "file"],
    ["Product Price", "price", "number"],
    ["Offer Price", "offer-price", "number"],
    ["Start Date & Time", "start-date-time", "datetime-local"],
    ["End Date & Time", "end-date-time", "datetime-local"],
    ["Description", "description", "textarea"],
  ],
  office: [
    ["Office ID", "office-id"],
    ["Office Name", "office-name"],
    ["Address", "address", "textarea"],
    ["Phone", "phone", "tel"],
    ["Email", "email", "email"],
    ["Map Link (Optional)", "map-link", "url"],
  ],
  notification: [
    ["ID", "id"],
    ["Title", "title"],
    ["Message", "message", "textarea"],
    ["User Type", "user-type", "select", ["All Users", "Premium Users", "Inactive Users"]],
    ["Sent By", "sent-by"],
    ["Sent At", "sent-at", "datetime-local"],
    ["Created At", "created-at", "datetime-local"],
    ["Updated At", "updated-at", "datetime-local"],
  ],
};

const QuizQuestions = () => {
  const [questions, setQuestions] = useState([1]);
  const totalMarks = questions.length * 5;

  return (
    <>
      <div className="mb-3 d-flex align-items-center justify-content-between">
        <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setQuestions((items) => [items.length + 1, ...items])}>
          <i className="fa fa-plus me-1" />
          Add Question
        </button>
        <strong>Total Marks: {totalMarks}</strong>
      </div>
      {questions.map((item) => (
        <div className="rti-question-editor" key={item} data-question-number={item}>
          <div className="d-flex align-items-center justify-content-between">
            <h5>Question {item}</h5>
            <button type="button" className="btn btn-danger btn-xs" onClick={() => setQuestions((items) => items.filter((question) => question !== item))}>
              <i className="fa fa-trash" />
            </button>
          </div>
          <Field label="Question" name={`question-${item}`} as="textarea" />
          <Field label="Marks" name={`marks-${item}`} type="number" />
          <div className="row">
            <div className="col-xl-6"><Field label="Option A" name={`option-a-${item}`} /></div>
            <div className="col-xl-6"><Field label="Option B" name={`option-b-${item}`} /></div>
            <div className="col-xl-6"><Field label="Option C" name={`option-c-${item}`} /></div>
            <div className="col-xl-6"><Field label="Option D" name={`option-d-${item}`} /></div>
          </div>
          <Field label="Correct Answer" name={`correct-${item}`} as="select" options={["A", "B", "C", "D"]} />
          <Field label="Explanation" name={`explanation-${item}`} as="textarea" />
        </div>
      ))}
    </>
  );
};

export const ModuleForm = ({ slug, mode = "Update" }) => {
  const config = getConfig(slug);
  const navigate = useNavigate();
  const fields = formFields[config.form] || [];
  const isQuiz = config.form === "quiz";

  const allFields = useMemo(() => {
    if (!isQuiz) return fields;
    return [
      ["Title", "title"],
      ["Subject", "subject", "select", ["RTI", "BNS", "Journalism"]],
      ["Difficulty", "difficulty", "select", ["Easy", "Medium", "Hard"]],
      ["Status", "status", "select", ["Active", "Inactive"]],
      ["Test Types", "test-types", "select", ["Practice (20 Q)", "Training (50 Q)", "Exam (100 Q)"]],
      ["Marks", "marks", "number"],
    ];
  }, [fields, isQuiz]);

  const submitLabel =
    mode === "Add"
      ? slug === "news" ? "Create News"
      : slug === "subscription-plan" ? "Create Subscription"
      : slug === "quiz" ? "Submit All Questions"
      : `Create ${config.title}`
      : slug === "subscription-plan" ? "Create Subscription" : `Update ${config.title}`;

  return (
    <>
      <PageHeading title={`${mode} ${config.title}`}>
        <Link to={`/admin/${slug}`} className="btn btn-light">
          <i className="fa fa-arrow-left me-2" />
          Back
        </Link>
      </PageHeading>
      <div className="card">
        <div className="card-header">
          <h4 className="card-title mb-0">{mode} Form</h4>
        </div>
        <div className="card-body">
          <form className="form-valide" onSubmit={(event) => {
            event.preventDefault();
            const record = makeRecordFromForm(slug, config, event.currentTarget);
            const currentRows = getStoredRows(slug);
            const nextRows = mode === "Add" ? [record, ...currentRows] : [record, ...currentRows.slice(1)];
            saveStoredRows(slug, nextRows);
            sessionStorage.setItem("moduleToast", `${pickRecordTitle(record)} ${mode === "Add" ? "added" : "updated"} successfully`);
            navigate(`/admin/${slug}`);
          }}>
            <div className="row">
              <div className="col-xl-6">
                {allFields.slice(0, Math.ceil(allFields.length / 2)).map(([label, name, type, options]) => {
                  if (type === "select") return <Field key={name} label={label} name={name} as="select" options={options} />;
                  if (type === "select-multiple") return <Field key={name} label={label} name={name} as="select" options={options} multiple />;
                  if (type === "textarea") return <Field key={name} label={label} name={name} as="textarea" />;
                  if (type === "file") return <FileUpload key={name} label={label} />;
                  return <Field key={name} label={label} name={name} type={type || "text"} />;
                })}
                {config.form === "user" && <ImageUpload title="Profile Image Upload" />}
              </div>
              <div className="col-xl-6">
                {allFields.slice(Math.ceil(allFields.length / 2)).map(([label, name, type, options]) => {
                  if (type === "select") return <Field key={name} label={label} name={name} as="select" options={options} />;
                  if (type === "select-multiple") return <Field key={name} label={label} name={name} as="select" options={options} multiple />;
                  if (type === "textarea") return <Field key={name} label={label} name={name} as="textarea" />;
                  if (type === "file") return <FileUpload key={name} label={label} />;
                  return <Field key={name} label={label} name={name} type={type || "text"} />;
                })}
                {config.form === "user" && (
                  <>
                    <FileUpload label="Certificate Upload" />
                    <FileUpload label="Appointment Letter Upload" />
                    <FileUpload label="User ID Card Upload" />
                    <Field label="Bio Textarea" name="bio" as="textarea" />
                  </>
                )}
              </div>
            </div>
            {isQuiz && <QuizQuestions />}
            <div className="form-group mb-3 row">
              <div className="col-lg-8 ms-auto">
                <button type="submit" className="btn btn-primary">{submitLabel}</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

const ModalShell = ({ slug, children }) => {
  const navigate = useNavigate();
  return (
    <div className="modal-page">
      <section className="delete-modal card">
        <button type="button" className="modal-close" onClick={() => navigate(`/admin/${slug}`)}>
          <i className="fa-solid fa-xmark" />
        </button>
        {children}
      </section>
    </div>
  );
};

export const ModuleDelete = ({ slug }) => {
  const navigate = useNavigate();
  const row = firstRow(slug);

  return (
    <ModalShell slug={slug}>
      <img src={row.image || profile} alt={row.name || row.title} />
      <h3>Delete Confirmation</h3>
      <p>{row.name || row.username || row.title || row.officeName || row.id}</p>
      <p>{row.email || "admin@example.com"}</p>
      <p>{row.phone || "9876543210"}</p>
      <button type="button" className="btn btn-danger" onClick={() => navigate(`/admin/${slug}`)}>
        Delete
      </button>
    </ModalShell>
  );
};

export const ModuleStatus = ({ slug }) => {
  const row = firstRow(slug);
  const [active, setActive] = useState((row.status || "Active") === "Active");

  return (
    <ModalShell slug={slug}>
      <img src={row.image || profile} alt={row.name || row.title} />
      <h3>Status Update</h3>
      <p>{row.name || row.username || row.title || row.productName}</p>
      <p>{row.email || "admin@example.com"}</p>
      <p>{row.phone || "9876543210"}</p>
      <p>Current status: {statusBadge(active ? "Active" : "Inactive")}</p>
      <div className="form-check form-switch d-inline-flex align-items-center gap-2 justify-content-center">
        <input className="form-check-input" type="checkbox" role="switch" checked={active} onChange={() => setActive((value) => !value)} id="statusSwitch" />
        <label className="form-check-label" htmlFor="statusSwitch">
          {active ? "Active" : "Inactive"}
        </label>
      </div>
    </ModalShell>
  );
};
