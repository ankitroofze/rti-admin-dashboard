import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Collapse, Modal } from "react-bootstrap";
import Select from "react-select";
import swal from "sweetalert";
import profile from "../assets/images/profile/profile.png";
import avatar1 from "../assets/images/avatar/1.jpg";
import avatar2 from "../assets/images/avatar/2.jpg";
import avatar3 from "../assets/images/avatar/3.jpg";
import logo from "../assets/images/rti.png";
import qrcode from "../assets/images/qr.png";
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

const indianPhonePattern = "(?!([0-9])\\1{9})[6-9][0-9]{9}";
const emailPattern = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";
const googleMapsPattern = "^https?:\\/\\/(www\\.)?(google\\.[a-z.]+\\/maps|maps\\.app\\.goo\\.gl|goo\\.gl\\/maps).+";
const pdfUrl =
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

const rowKey = (row = {}) => String(row._rowKey || row.id || row.profileId || row.userId || row.transactionId || row.adId || row.title || row.sr || "");
const activeRecordKey = (slug) => `rti-active-${slug}`;
const selectOption = (value) => ({ value, label: value });
const toSelectOptions = (items = []) => items.map(selectOption);
const CustomClearText = () => "clear all";
const ClearIndicator = (props) => {
  const {
    children = <CustomClearText />,
    getStyles,
    innerProps: { ref, ...restInnerProps },
  } = props;
  return (
    <div {...restInnerProps} ref={ref} style={getStyles("clearIndicator", props)}>
      <div style={{ padding: "0px 5px" }}>{children}</div>
    </div>
  );
};
const ClearIndicatorStyles = (base, state) => ({
  ...base,
  cursor: "pointer",
  color: state.isFocused ? "blue" : "black",
});
const readFileAsDataUrl = (file) => new Promise((resolve) => {
  if (!(file instanceof File) || !file.size) {
    resolve("");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result || "");
  reader.onerror = () => resolve("");
  reader.readAsDataURL(file);
});

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
const toDateInputValue = (value) => {
  if (!value) return "";
  const parsed = new Date(String(value).replace(/-/g, " "));
  if (Number.isNaN(parsed.getTime())) return "";
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${parsed.getFullYear()}-${month}-${day}`;
};

const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const unionTerritories = [
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const stateOptions = [...states, ...unionTerritories];

const districtMap = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Nellore", "Visakhapatnam"],
  "Arunachal Pradesh": ["Itanagar Capital Complex", "Tawang", "West Kameng", "Lower Subansiri", "East Siang"],
  Assam: ["Guwahati", "Dibrugarh", "Jorhat", "Silchar", "Tezpur"],
  Bihar: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga"],
  Chhattisgarh: ["Raipur", "Bilaspur", "Durg", "Korba", "Raigarh"],
  Goa: ["North Goa", "South Goa"],
  Maharashtra: ["Pune", "Mumbai", "Nagpur", "Nashik"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  Haryana: ["Gurugram", "Faridabad", "Hisar", "Karnal", "Panipat"],
  "Himachal Pradesh": ["Shimla", "Kangra", "Mandi", "Kullu", "Solan"],
  Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh"],
  Karnataka: ["Bengaluru Urban", "Mysuru", "Mangaluru", "Belagavi", "Hubballi Dharwad"],
  Kerala: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kannur"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain"],
  Manipur: ["Imphal East", "Imphal West", "Thoubal", "Bishnupur"],
  Meghalaya: ["East Khasi Hills", "West Garo Hills", "Ri Bhoi", "Jaintia Hills"],
  Mizoram: ["Aizawl", "Lunglei", "Champhai", "Kolasib"],
  Nagaland: ["Kohima", "Dimapur", "Mokokchung", "Wokha"],
  Odisha: ["Bhubaneswar", "Cuttack", "Puri", "Sambalpur", "Balasore"],
  Punjab: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
  Sikkim: ["Gangtok", "Namchi", "Gyalshing", "Mangan"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli"],
  Telangana: ["Hyderabad", "Warangal", "Karimnagar", "Nizamabad", "Khammam"],
  Tripura: ["West Tripura", "Sepahijala", "Gomati", "North Tripura"],
  Uttarakhand: ["Dehradun", "Haridwar", "Nainital", "Udham Singh Nagar", "Almora"],
  "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Siliguri"],
  "Andaman and Nicobar Islands": ["South Andaman", "North and Middle Andaman", "Nicobar"],
  Chandigarh: ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli", "Daman", "Diu"],
  Delhi: ["New Delhi", "Central Delhi", "South Delhi", "North Delhi", "East Delhi"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur"],
  Ladakh: ["Leh", "Kargil"],
  Lakshadweep: ["Kavaratti", "Agatti", "Minicoy"],
  Puducherry: ["Puducherry", "Karaikal", "Mahe", "Yanam"],
};

const talukaMap = {
  Pune: ["Haveli", "Mulshi", "Maval", "Baramati", "Shirur"],
  Mumbai: ["Andheri", "Borivali", "Kurla", "Dadar"],
  Nagpur: ["Nagpur Urban", "Kamptee", "Hingna", "Katol"],
  Nashik: ["Nashik", "Igatpuri", "Sinnar", "Dindori"],
  Ahmedabad: ["Daskroi", "Sanand", "Viramgam", "Dholka"],
  Surat: ["Chorasi", "Olpad", "Kamrej", "Bardoli"],
  Vadodara: ["Vadodara", "Padra", "Dabhoi", "Karjan"],
  Rajkot: ["Rajkot", "Gondal", "Jetpur", "Dhoraji"],
};

const defaultDistricts = [];
const defaultTalukas = [];
const getDistrictOptions = (state) => districtMap[state] || [];
const getTalukaOptions = (district) => talukaMap[district] || (district ? [`${district} Urban`, `${district} Rural`, `${district} Sadar`] : []);

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
    ],
    filters: ["search", "status", "userType"],
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
    filters: ["search", "status", "userType"],
    rows: users,
    columns: [
      ["sr", "Sr.No"],
      ["profileId", "Profile ID"],
      ["profileImage", "Profile Image"],
      ["name", "Name"],
      ["phone", "Phone Number"],
      ["status", "Status"],
    ],
    actions: ["view", "update", "status", "delete"],
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
    filters: ["search", "status"],
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
    filters: ["search", "status", "subject", "difficulty"],
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
    add: false,
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

const dataSlug = (slug) => slug === "dashboard" ? "user-profile" : slug;
const storageKey = (slug) => `rti-module-${dataSlug(slug)}`;

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

const getRows = (slug) => {
  const storedRows = getStoredRows(slug);
  const storedKeys = new Set(storedRows.map(rowKey));
  const baseRows = (getConfig(dataSlug(slug)).rows || getConfig(slug).rows || []).filter((row) => !storedKeys.has(rowKey(row)));
  return [...storedRows, ...baseRows].filter((row) => row && typeof row === "object");
};
const updateStoredRow = (slug, updatedRow) => {
  const key = rowKey(updatedRow);
  const rows = getRows(slug);
  const nextRows = rows.some((item) => rowKey(item) === key)
    ? rows.map((item) => rowKey(item) === key ? updatedRow : item)
    : [updatedRow, ...rows];
  saveStoredRows(slug, nextRows);
  return nextRows;
};
const activeRow = (slug) => {
  const rows = getRows(slug);
  const activeKey = sessionStorage.getItem(activeRecordKey(slug));
  return rows.find((row) => rowKey(row) === activeKey) || rows[0] || {};
};

const pickRecordTitle = (row) => {
  const record = row || {};
  return record.name || record.username || record.title || record.productName || record.officeName || record.userId || record.transactionId || record.id || "this record";
};

const pickRecordSubTitle = (row) => {
  const record = row || {};
  return record.email || record.phone || record.orderId || record.transactionId || record.userType || record.category || record.amount || "";
};

const isPositiveStatus = (status) => ["Active", "Approved", "Paid"].includes(status);
const nextStatusForSlug = (slug, status = "Active") => {
  if (slug === "withdrawal") {
    const statuses = ["Approved", "Failed", "Pending"];
    return statuses[(statuses.indexOf(status) + 1) % statuses.length] || "Approved";
  }
  return isPositiveStatus(status) ? "Inactive" : "Active";
};

const statusBadge = (status) => (
  <span className={`badge light badge-${isPositiveStatus(status) ? "success" : status === "Pending" ? "warning" : "danger"}`}>
    {status || "Active"}
  </span>
);

const StatusToggle = ({ status = "Active", onClick = () => {} }) => (
  <button
    type="button"
    className={`rti-status-toggle ${isPositiveStatus(status) ? "active" : "inactive"}`}
    onClick={onClick}
  >
    <span />
    {status || "Active"}
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

const FilterBar = ({ filters = [], values, onChange, onReset, slug }) => {
  const [open, setOpen] = useState(false);
  if (!filters.length) return null;
  const statusOptions = slug === "withdrawal" ? ["Approved", "Failed", "Pending"] : ["Active", "Inactive"];
  const selectFilters = {
    state: ["State", stateOptions],
    district: ["District", Object.values(districtMap).flat()],
    taluka: ["Taluka", defaultTalukas],
    status: ["Status", statusOptions],
    filterStatus: ["Filter Status", statusOptions],
    category: ["Category", newsCategories],
    subject: ["Subject", ["RTI", "BNS", "Journalism"]],
    difficulty: ["Difficulty", ["Easy", "Medium", "Hard"]],
    testType: ["Test Type", ["Practice (20 Q)", "Training (50 Q)", "Exam (100 Q)"]],
    correctAnswer: ["Correct Answer", ["A", "B", "C", "D"]],
    userType: ["User Type", ["Free", "Premium", "All Users", "Premium Users", "Inactive Users"]],
  };

  return (
    <div className="row">
      <div className="col-xl-12">
        <div className="filter cm-content-box box-primary rti-table-filters">
          <div className="content-title">
            <div className="cpa">
              <i className="fas fa-filter me-2"></i>Filter
            </div>
            <div className="tools">
              <Link
                to="#"
                className={`SlideToolHeader ${open ? "collapse" : "expand"}`}
                onClick={(event) => {
                  event.preventDefault();
                  setOpen(!open);
                }}
              >
                <i className="fas fa-angle-up"></i>
              </Link>
            </div>
          </div>

          <Collapse in={open}>
            <div className="cm-content-body form excerpt">
              <div className="card-body">
                <div className="row filter-row">
                  {filters.includes("search") && (
                    <div className="col-xl-3 col-xxl-6">
                      <input className="form-control mb-xl-0 mb-3" type="search" placeholder="Search..." value={values.search} onChange={(event) => onChange("search", event.target.value)} />
                    </div>
                  )}
                  {Object.entries(selectFilters).map(([name, [label, options]]) => filters.includes(name) && (
                    <div className="col-xl-3 col-xxl-6" key={name}>
                      <Select
                        isSearchable={false}
                        options={toSelectOptions(options)}
                        className="custom-react-select mb-3 mb-xxl-0"
                        classNamePrefix="rti-react-select"
                        isClearable
                        placeholder={label}
                        value={values[name] ? selectOption(values[name]) : null}
                        onChange={(option) => onChange(name, option?.value || "")}
                      />
                    </div>
                  ))}
                  <div className="col-xl-3 col-xxl-6">
                    <input type="date" name="datepicker" className="form-control mb-xxl-0 mb-3" value={values.dateFilter} onChange={(event) => onChange("dateFilter", event.target.value)} />
                  </div>
                  <div className="col-xl-3 col-xxl-6">
                    <button className="btn btn-primary me-2" title="Click here to Search" type="button">
                      <i className="fa fa-search me-1"></i>Filter
                    </button>
                    <button className="btn btn-danger light" title="Click here to remove filter" type="button" onClick={onReset}>Remove</button>
                  </div>
                </div>
              </div>
            </div>
          </Collapse>
        </div>
      </div>
    </div>
  );
};

const DashboardCards = ({ stats = [], selected = "all", onSelect }) => (
  <div className="row rti-dashboard-cards">
    {stats.map(([label, value, icon, color, key], index) => (
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
          <div className="rti-card-progress">
            <div
              className={`progress-bar progress-bar-striped bg-${color}`}
              style={{ width: `${[85, 70, 55, 65, 45][index] || 60}%` }}
            />
          </div>
          <div className={`effect bg-${color}`} />
        </button>
      </div>
    ))}
  </div>
);

const setActiveRecord = (slug, row) => {
  sessionStorage.setItem(activeRecordKey(slug), rowKey(row));
};

const openWithdrawalInvoice = (row) => {
  const subtotal = Number(row.amount || 0);
  const gst = Number(row.gstAmount || 0);
  const total = Number(row.totalAmount || subtotal + gst);
  const invoiceHtml = `
    <html>
      <head>
        <title>Invoice ${row.transactionId || ""}</title>
        <style>
          body{font-family:Arial,sans-serif;margin:24px;color:#111827}.card{border:1px solid #ddd;border-radius:8px}.card-header{padding:14px 18px;border-bottom:1px solid #ddd}.card-body{padding:18px}.row{display:flex;flex-wrap:wrap;margin:0 -10px}.col{padding:10px;flex:1 1 240px}.right{text-align:right}.center{text-align:center}.brand{display:flex;align-items:center;gap:10px;margin-bottom:12px}.brand img{height:52px}.qr{width:110px}.table{width:100%;border-collapse:collapse;margin:18px 0}.table th,.table td{border-bottom:1px solid #e5e7eb;padding:10px;text-align:left}.table th.right,.table td.right{text-align:right}.table th.center,.table td.center{text-align:center}.summary{margin-left:auto;width:320px}.summary td{padding:8px;border-bottom:1px solid #e5e7eb}@media print{button{display:none}}
        </style>
      </head>
      <body>
        <div class="card">
          <div class="card-header">Invoice <strong>${formatDisplayDate(row.paidAt || row.createdAt || new Date())}</strong><span style="float:right"><strong>Status:</strong> ${row.status || "Pending"}</span></div>
          <div class="card-body">
            <div class="row">
              <div class="col"><h6>From:</h6><strong>RTI Admin Dashboard</strong><div>Roofze Digital Hub</div><div>Email: admin@rti.com</div><div>Phone: +91 98765 43210</div></div>
              <div class="col"><h6>To:</h6><strong>${row.userId || "User"}</strong><div>Order: ${row.orderId || "-"}</div><div>Payment: ${row.paymentId || "-"}</div><div>Method: ${row.paymentMethod || "-"}</div></div>
              <div class="col"><div class="brand"><img src="${logo}" /><strong>RTI</strong></div><span>Please verify exact amount:<strong style="display:block">₹${total}</strong><strong>${row.transactionId || "-"}</strong></span><br/><small>Generated from withdrawal details</small><div><img src="${qrcode}" class="qr" /></div></div>
            </div>
            <table class="table"><thead><tr><th class="center">#</th><th>Item</th><th>Description</th><th class="right">Unit Cost</th><th class="center">Qty</th><th class="right">Total</th></tr></thead><tbody>
              <tr><td class="center">1</td><td>Withdrawal</td><td>${row.transactionId || "Withdrawal request"}</td><td class="right">₹${subtotal}</td><td class="center">1</td><td class="right">₹${subtotal}</td></tr>
              <tr><td class="center">2</td><td>GST</td><td>Tax Amount</td><td class="right">₹${gst}</td><td class="center">1</td><td class="right">₹${gst}</td></tr>
            </tbody></table>
            <table class="summary"><tbody><tr><td><strong>Subtotal</strong></td><td class="right">₹${subtotal}</td></tr><tr><td><strong>GST</strong></td><td class="right">₹${gst}</td></tr><tr><td><strong>Total</strong></td><td class="right"><strong>₹${total}</strong></td></tr></tbody></table>
          </div>
        </div>
        <script>window.print()</script>
      </body>
    </html>`;
  const win = window.open("", "_blank");
  win?.document.write(invoiceHtml);
  win?.document.close();
};

const ActionButtons = ({ slug, actions, row, onDelete, onStatus }) => (
  <div className="rti-action-buttons">
    {actions.includes("generatePdf") && (
      <a href={pdfUrl} target="_blank" rel="noreferrer" className="btn btn-secondary shadow btn-xs sharp">
        <i className="fa fa-file-pdf" />
      </a>
    )}
    {actions.includes("view") && (
      <Link to={`/admin/${slug}/view`} className="btn btn-info shadow btn-xs sharp" onClick={() => setActiveRecord(slug, row)}>
        <i className="fa fa-eye" />
      </Link>
    )}
    {actions.includes("update") && (
      <Link to={`/admin/${slug}/update`} className="btn btn-primary shadow btn-xs sharp" onClick={() => setActiveRecord(slug, row)}>
        <i className="fas fa-pen" />
      </Link>
    )}
    {actions.includes("invoice") && (
      <button type="button" onClick={() => openWithdrawalInvoice(row)} className="btn btn-secondary shadow btn-xs sharp">
        <i className="fa fa-download" />
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
      <a href={row.pdfFilesUrl || pdfUrl} target="_blank" rel="noreferrer" className="text-primary">
        <i className="fa fa-file-pdf me-1" />
        {row.pdfFiles}
      </a>
    );
  }
  const value = row[field] || "-";
  const text = formatDisplayDate(value) || value;
  if (typeof text === "string" && text.length > 24) {
    return (
      <Link to={`/admin/${slug}/view`} className="rti-truncate-link" title={text} onClick={() => setActiveRecord(slug, row)}>
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
    dateFilter: "",
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
      const dateHaystack = Object.values(row).map((value) => formatDisplayDate(value) || value).join(" ").toLowerCase();
      if (cardFilter === "active" && row.status !== "Active") return false;
      if (cardFilter === "inactive" && row.status !== "Inactive") return false;
      if (cardFilter === "premium" && row.userType !== "Premium") return false;
      if (cardFilter === "new" && !String(row.createdDate || row.createdAt || "").includes("13 May 2026")) return false;
      if (filters.search && !haystack.includes(filters.search.toLowerCase())) return false;
      if (filters.dateFilter) {
        const formattedDate = formatDisplayDate(filters.dateFilter).toLowerCase();
        if (!haystack.includes(formattedDate) && !dateHaystack.includes(formattedDate) && !haystack.includes(filters.dateFilter.toLowerCase())) return false;
      }
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
  const resetFilters = () => {
    setFilters((current) => Object.fromEntries(Object.keys(current).map((key) => [key, ""])));
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
        <div className="card rti-module-table-card">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
            <h4 className="card-title mb-0 rti-table-title-tab">{config.title} List</h4>
            {config.add && (
              <Link to={`/admin/${slug}/add`} className="btn btn-primary btn-sm">
                <i className="fa fa-plus me-2" />
                {addLabel}
              </Link>
            )}
          </div>
          <div className="card-body">
            <FilterBar filters={config.filters} values={filters} onChange={onFilterChange} onReset={resetFilters} slug={slug} />
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
          saveStoredRows(slug, nextRows);
          setDeleteRow(null);
          setToast(`${pickRecordTitle(deleteRow)} deleted successfully`);
        }}
      />
      <ConfirmModal
        show={Boolean(statusRow)}
        title="Status Confirmation"
        row={statusRow}
        message={`Do you want to change ${pickRecordTitle(statusRow)} from ${statusRow?.status || "Active"} to ${nextStatusForSlug(slug, statusRow?.status || "Active")}?`}
        confirmText="Yes"
        onHide={() => setStatusRow(null)}
        onConfirm={() => {
          const nextRows = moduleRows.map((item) => item === statusRow ? { ...item, status: nextStatusForSlug(slug, item.status || "Active") } : item);
          setModuleRows(nextRows);
          saveStoredRows(slug, nextRows);
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
            {field === "status" ? <StatusToggle status={row[field] || "Active"} onClick={onStatus} /> : field === "pdfFiles" || field.toLowerCase().includes("pdf") ? (
              <a href={row[`${field}Url`] || pdfUrl} target="_blank" rel="noreferrer">
                <i className="fa fa-file-pdf me-1" />
                {row[field] || labels[field]}
              </a>
            ) : field === "mediaFile" && row.mediaFileUrl ? (
              <a href={row.mediaFileUrl} target="_blank" rel="noreferrer">
                <i className="fa fa-paperclip me-1" />
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
  <div className="card rti-profile-details-card">
    <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-3">
      <div className="d-flex align-items-center gap-3">
        <div>
          <button type="button" className="rti-image-button" onClick={() => onImage(row.image || profile)}>
            <img src={row.image || profile} alt={row.name || row.username} className="rounded-circle rti-profile-detail-avatar" />
          </button>
        </div>
        <div>
          <h4 className="card-title mb-1">{row.name || row.username}</h4>
          <p className="mb-0 text-muted">{row.profileId || row.userId}</p>
        </div>
      </div>
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

const QuizDetail = ({ row, editable = false, onStatus }) => {
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
          <div className="col-md-3"><strong>Status:</strong> <StatusToggle status={row.status || "Active"} onClick={onStatus} /></div>
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
  const [row, setRow] = useState(() => activeRow(slug));
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
        <QuizDetail row={row} onStatus={() => setConfirmStatus(true)} />
      ) : config.profileView || slug === "network" ? (
        <ProfileDetailLayout row={row} config={config} onImage={setImagePreview} onStatus={() => setConfirmStatus(true)} />
      ) : (
        <>
        <div className="card">
          <div className="card-header d-flex justify-content-between">
            <h4 className="card-title mb-0">{config.title} Details</h4>
            {slug === "withdrawal" && (
              <button type="button" className="btn btn-primary btn-sm" onClick={() => openWithdrawalInvoice(row)}>
                <i className="fa fa-download me-1" />
                Download Invoice
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
        message={`Do you want to change ${pickRecordTitle(row)} from ${row.status || "Active"} to ${nextStatusForSlug(slug, row.status || "Active")}?`}
        onHide={() => setConfirmStatus(false)}
        onConfirm={() => {
          setRow((current) => {
            const updated = { ...current, status: nextStatusForSlug(slug, current.status || "Active") };
            updateStoredRow(slug, updated);
            sessionStorage.setItem(activeRecordKey(slug), rowKey(updated));
            return updated;
          });
          setConfirmStatus(false);
          setToast(`${pickRecordTitle(row)} status updated successfully`);
        }}
      />
      <ImageModal image={imagePreview} onHide={() => setImagePreview("")} />
    </>
  );
};

const Field = ({ label, name, type = "text", as = "input", options, multiple = false, required = true, readOnly = false, accept, value = "", allowCustom = false, onValueChange, disabled = false }) => {
  const initialSelected = multiple
    ? String(value || "").split(",").map((item) => item.trim()).filter(Boolean).map(selectOption)
    : value ? selectOption(value) : null;
  const [selected, setSelected] = useState(initialSelected);
  const [textValue, setTextValue] = useState((type === "date" || type === "datetime-local") ? toDateInputValue(value) : value || "");
  const inputType = type;
  const hiddenValue = multiple ? selected.map((option) => option.value).join(", ") : selected?.value || "";

  return (
    <div className="form-group mb-3 row">
      <label className="col-lg-4 col-form-label" htmlFor={name}>
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <div className="col-lg-8">
        {allowCustom ? (
          <>
            <input
              className="form-control"
              list={`${name}-options`}
              id={name}
              name={name}
              placeholder={label}
              value={textValue}
              onChange={(event) => setTextValue(event.target.value)}
              required={required}
            />
            <datalist id={`${name}-options`}>
              {(options || []).map((option) => <option value={option} key={option} />)}
            </datalist>
          </>
        ) : as === "select" ? (
          <div className="card-body Cms-selecter p-0">
            <label className="from-label visually-hidden">{label}</label>
            <Select
              options={toSelectOptions(options)}
              className="custom-react-select"
              classNamePrefix="rti-react-select"
              isClearable
              isMulti={multiple}
              isDisabled={disabled}
              closeMenuOnSelect={!multiple}
              components={multiple ? { ClearIndicator } : undefined}
              styles={multiple ? { clearIndicator: ClearIndicatorStyles } : undefined}
              placeholder={label}
              value={selected}
              onChange={(value) => {
                setSelected(value || (multiple ? [] : null));
                if (!multiple) onValueChange?.(value?.value || "");
              }}
            />
            <input type="hidden" id={name} name={name} value={hiddenValue} readOnly />
          </div>
        ) : as === "textarea" ? (
          <textarea className="form-control" id={name} name={name} rows="5" placeholder={label} value={textValue} onChange={(event) => setTextValue(event.target.value)} />
        ) : (
          <input
            type={inputType}
            className="form-control"
            id={name}
            name={name}
            placeholder={label}
            readOnly={readOnly}
            accept={accept}
            value={type === "file" ? undefined : textValue}
            title={type === "tel" ? "Enter a 10 digit mobile number starting with 6, 7, 8 or 9. Repeated same digits are not allowed." : name === "map-link" ? "Enter a valid Google Maps link." : undefined}
            maxLength={type === "tel" ? 10 : undefined}
            min={undefined}
            required={required}
            disabled={disabled}
            pattern={name === "map-link" ? googleMapsPattern : type === "email" ? emailPattern : type === "tel" ? indianPhonePattern : undefined}
            onChange={(event) => {
              if (type !== "file") setTextValue(event.currentTarget.value);
            }}
            onInput={type === "tel" ? (event) => {
              event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "").slice(0, 10);
              setTextValue(event.currentTarget.value);
            } : undefined}
          />
        )}
      </div>
    </div>
  );
};

const makeRecordFromForm = async (slug, config, form, existing = {}) => {
  const formData = new FormData(form);
  const data = {};
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      if (value.size) {
        data[key] = value.name;
        data[`${key}Url`] = await readFileAsDataUrl(value);
      }
      continue;
    }
    data[key] = value;
  }
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
    ...existing,
    _local: true,
    _rowKey: rowKey(existing) || generatedId,
    sr: existing.sr || Date.now(),
    id: data.id || data["news-id"] || data["epaper-id"] || data["ad-id"] || data["office-id"] || existing.id || generatedId,
    adId: data["ad-id"] || existing.adId || "",
    userId: data["user-id"] || data["rank-user-id"] || existing.userId || generatedId,
    profileId: data["user-id"] || existing.profileId || generatedId,
    transactionId: data["transaction-id"] || existing.transactionId || generatedId,
    orderId: data["order-id"] || "",
    name: data["full-name"] || data.name || data.title || "New Record",
    username: data.username || data["full-name"] || data.title || "New Record",
    title: data.title || data["full-name"] || "New Record",
    author: data.author || "",
    email: data.email || "",
    phone: data.phone || data["mobile-number"] || "",
    mobileNumber: data["mobile-number"] || data.phone || "",
    image: data.imageUrl || data["media-fileUrl"] || existing.image || (["user", "ad"].includes(config.form) ? profile : undefined),
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
    mapLink: data["map-link"] || existing.mapLink || "",
    userType: data["user-type"] || "",
    mediaFile: data["media-file"] || existing.mediaFile || "",
    mediaFileUrl: data["media-fileUrl"] || existing.mediaFileUrl || "",
    pdfFiles: data["pdf-files"] || existing.pdfFiles || "",
    pdfFilesUrl: data["pdf-filesUrl"] || existing.pdfFilesUrl || "",
    publishDate: formatDisplayDate(data["publish-date"]) || "",
    totalPage: data["total-page"] || "",
    amount: data.amount || data.price || "",
    price: data.price || "",
    offerPrice: data["offer-price"] || "",
    message: data.message || "",
    sentBy: data["sent-by"] || existing.sentBy || "",
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
    createdDate: existing.createdDate || now,
    createdAt: formatDisplayDate(data["created-at"]) || now,
    updatedAt: formatDisplayDate(data["updated-at"]) || now,
  };
};

const looksLikeBadGmail = (email = "") => {
  const domain = String(email).split("@")[1] || "";
  return /g\s*m\s*a\s*i\s*l/i.test(domain) && domain.toLowerCase() !== "gmail.com";
};

const validateModuleForm = (slug, form) => {
  const email = form.elements.email?.value || "";
  if (email && (!new RegExp(emailPattern).test(email) || looksLikeBadGmail(email))) {
    swal("Invalid Email", "Please enter a valid email address. Gmail addresses must end with @gmail.com.", "error");
    form.elements.email?.focus();
    return false;
  }

  const phoneInput = form.elements.phone || form.elements["mobile-number"];
  if (phoneInput?.value && !new RegExp(`^${indianPhonePattern}$`).test(phoneInput.value)) {
    swal("Invalid Phone Number", "Enter a unique 10 digit number starting with 6, 7, 8 or 9.", "error");
    phoneInput.focus();
    return false;
  }

  const mapLink = form.elements["map-link"]?.value || "";
  if (mapLink && !new RegExp(googleMapsPattern, "i").test(mapLink)) {
    swal("Invalid Map Link", "Please enter a valid Google Maps link.", "error");
    form.elements["map-link"]?.focus();
    return false;
  }

  const start = form.elements["start-date"]?.value || form.elements["start-date-time"]?.value || "";
  const end = form.elements["end-date"]?.value || form.elements["end-date-time"]?.value || "";
  if (start && end && new Date(end) <= new Date(start)) {
    swal("Invalid Date Range", "End date must be after start date.", "error");
    (form.elements["end-date"] || form.elements["end-date-time"])?.focus();
    return false;
  }

  if (["user-profile", "subscription-plan"].includes(slug)) {
    if (!form.elements.state?.value || !form.elements.district?.value || !form.elements.taluka?.value) {
      swal("Location Required", "Please select state, district and taluka in order.", "error");
      return false;
    }
  }

  return true;
};

const ImageUpload = ({ title = "Profile Image Upload", value = "" }) => {
  const [file, setFile] = useState();
  const preview = file ? URL.createObjectURL(file) : value || profile;

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
              <input type="file" name="image" accept="image/*" onChange={(event) => setFile(event.target.files?.[0])} id="imageUpload" className="form-control d-none" />
              <label htmlFor="imageUpload" className="btn btn-light ms-0">Select Image</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FileUpload = ({ label, accept = ".pdf,image/*,video/*", required = true, currentName = "", currentUrl = "" }) => (
  <>
    <Field label={label} name={label.toLowerCase().replaceAll(" ", "-")} type="file" accept={accept} required={required && !currentName} />
    {currentName && (
      <div className="form-group mb-3 row">
        <div className="col-lg-8 ms-auto">
          <a href={currentUrl || pdfUrl} target="_blank" rel="noreferrer" className="btn btn-outline-primary btn-sm">
            <i className="fa fa-paperclip me-1" />
            {currentName}
          </a>
        </div>
      </div>
    )}
  </>
);

const formFields = {
  user: [
    ["User ID", "user-id"],
    ["Full Name", "full-name"],
    ["Email Address", "email", "email"],
    ["Mobile Number", "mobile-number", "tel"],
    ["States", "state", "select", stateOptions],
    ["District", "district", "select", defaultDistricts],
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
    ["Create Date", "created-at", "date"],
    ["Description", "description", "textarea"],
  ],
  subscription: [
    ["Title", "title"],
    ["Roles", "role", "select-multiple", ["Chief Editor / Publisher", "Executive Editor", "Deputy Editor (National)", "Public Relations Officer (PRO)", "National Bureau Chief", "Pratinidhi"]],
    ["State", "state", "select", stateOptions],
    ["District", "district", "select", defaultDistricts],
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

const QuizQuestions = ({ currentRow = {} }) => {
  const existingQuestions = currentRow.questions?.length ? currentRow.questions : [];
  const [questions, setQuestions] = useState(existingQuestions.length ? existingQuestions.map((_, index) => index + 1) : [1]);
  const totalMarks = questions.length * 5;

  return (
    <>
      <div className="mb-3 d-flex align-items-center justify-content-between">
        <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setQuestions((items) => [...items, Math.max(...items, 0) + 1])}>
          <i className="fa fa-plus me-1" />
          Add Question
        </button>
        <strong>Total Marks: {totalMarks}</strong>
      </div>
      {questions.map((item) => (
        <div className="rti-question-editor" key={item} data-question-number={item}>
          <div className="d-flex align-items-center justify-content-between">
            <h5 className="rti-question-title"><span>Question</span><strong>{item}</strong></h5>
            <button type="button" className="btn btn-danger btn-xs" onClick={() => setQuestions((items) => items.filter((question) => question !== item))}>
              <i className="fa fa-trash" />
            </button>
          </div>
          <Field label="Question" name={`question-${item}`} as="textarea" value={existingQuestions[item - 1]?.question || ""} />
          <Field label="Marks" name={`marks-${item}`} type="number" value={existingQuestions[item - 1]?.marks || ""} />
          <div className="row">
            <div className="col-xl-6"><Field label="Option A" name={`option-a-${item}`} value={existingQuestions[item - 1]?.optionA || ""} /></div>
            <div className="col-xl-6"><Field label="Option B" name={`option-b-${item}`} value={existingQuestions[item - 1]?.optionB || ""} /></div>
            <div className="col-xl-6"><Field label="Option C" name={`option-c-${item}`} value={existingQuestions[item - 1]?.optionC || ""} /></div>
            <div className="col-xl-6"><Field label="Option D" name={`option-d-${item}`} value={existingQuestions[item - 1]?.optionD || ""} /></div>
          </div>
          <Field label="Correct Answer" name={`correct-${item}`} as="select" options={["A", "B", "C", "D"]} value={existingQuestions[item - 1]?.correctAnswer || ""} />
          <Field label="Explanation" name={`explanation-${item}`} as="textarea" value={existingQuestions[item - 1]?.explanation || ""} />
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
  const currentRow = mode === "Update" ? activeRow(slug) : {};
  const [locationState, setLocationState] = useState({
    state: currentRow.state || "",
    district: currentRow.district || "",
    taluka: currentRow.taluka || "",
  });

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

  const fieldValue = (name) => {
    const map = {
      "user-id": currentRow.userId,
      "full-name": currentRow.name,
      "mobile-number": currentRow.mobileNumber || currentRow.phone,
      "rank-user-id": currentRow.userId,
      "required-referrals": currentRow.requiredReferrals,
      "commission-percentage": currentRow.commissionPercentage || currentRow.commission,
      "reward-amount": currentRow.rewardAmount,
      "news-id": currentRow.id,
      "created-at": currentRow.createdAt,
      "epaper-id": currentRow.id,
      "publish-date": currentRow.publishDate,
      "total-page": currentRow.totalPage,
      "ad-id": currentRow.adId || currentRow.id,
      "product-name": currentRow.productName || currentRow.product,
      "offer-price": currentRow.offerPrice,
      "start-date": currentRow.subscriptionStartDate || currentRow.startDate,
      "end-date": currentRow.subscriptionEndDate || currentRow.endDate,
      "start-date-time": currentRow.startDateTime,
      "end-date-time": currentRow.endDateTime,
      "media-file": currentRow.mediaFile,
      "pdf-files": currentRow.pdfFiles,
      "office-id": currentRow.id,
      "office-name": currentRow.officeName,
      "map-link": currentRow.mapLink,
      "user-type": currentRow.userType,
      "sent-by": currentRow.sentBy,
      "sent-at": currentRow.sentAt,
      "updated-at": currentRow.updatedAt,
      "test-types": currentRow.testType,
    };
    return map[name] ?? currentRow[name] ?? "";
  };

  const renderField = ([label, name, type, options]) => {
    if (["subscription", "user"].includes(config.form) && ["state", "district", "taluka"].includes(name)) {
      const dynamicOptions = name === "state"
        ? stateOptions
        : name === "district"
          ? getDistrictOptions(locationState.state)
          : getTalukaOptions(locationState.district);
      return (
        <Field
          key={`${name}-${locationState.state}-${locationState.district}`}
          label={label}
          name={name}
          as="select"
          options={dynamicOptions}
          value={locationState[name]}
          disabled={(name === "district" && !locationState.state) || (name === "taluka" && !locationState.district)}
          onValueChange={(value) => setLocationState((current) => ({
            ...current,
            [name]: value,
            ...(name === "state" ? { district: "", taluka: "" } : {}),
            ...(name === "district" ? { taluka: "" } : {}),
          }))}
        />
      );
    }
    if (type === "select") return <Field key={name} label={label} name={name} as="select" options={options} value={fieldValue(name)} />;
    if (type === "select-multiple") return <Field key={name} label={label} name={name} as="select" options={options} multiple value={fieldValue(name)} />;
    if (type === "textarea") return <Field key={name} label={label} name={name} as="textarea" value={fieldValue(name)} />;
    if (type === "file") return <FileUpload key={name} label={label} currentName={fieldValue(name)} currentUrl={name === "media-file" ? currentRow.mediaFileUrl : name === "pdf-files" ? currentRow.pdfFilesUrl : ""} />;
    return <Field key={name} label={label} name={name} type={type || "text"} value={fieldValue(name)} />;
  };

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
          <form className="form-valide" onSubmit={async (event) => {
            event.preventDefault();
            if (!validateModuleForm(slug, event.currentTarget)) return;
            const record = await makeRecordFromForm(slug, config, event.currentTarget, currentRow);
            const currentRows = getStoredRows(slug);
            const currentKey = rowKey(currentRow);
            const nextRows = mode === "Add"
              ? [record, ...currentRows]
              : currentRows.some((item) => rowKey(item) === currentKey)
                ? currentRows.map((item) => rowKey(item) === currentKey ? record : item)
                : [record, ...currentRows];
            saveStoredRows(slug, nextRows);
            sessionStorage.setItem(activeRecordKey(slug), rowKey(record));
            sessionStorage.setItem("moduleToast", `${pickRecordTitle(record)} ${mode === "Add" ? "added" : "updated"} successfully`);
            navigate(`/admin/${slug}`);
          }}>
            <div className="row">
              <div className="col-xl-6">
                {allFields.slice(0, Math.ceil(allFields.length / 2)).map(renderField)}
                {config.form === "user" && <ImageUpload title="Profile Image Upload" value={currentRow.image} />}
              </div>
              <div className="col-xl-6">
                {allFields.slice(Math.ceil(allFields.length / 2)).map(renderField)}
                {config.form === "user" && (
                  <>
                    <FileUpload label="Certificate Upload" />
                    <FileUpload label="Appointment Letter Upload" />
                    <FileUpload label="User ID Card Upload" />
                    <Field label="Bio Textarea" name="bio" as="textarea" value={currentRow.bio || ""} />
                  </>
                )}
              </div>
            </div>
            {isQuiz && <QuizQuestions currentRow={currentRow} />}
            <div className="form-group mb-3 row">
              <div className="col-lg-8 ms-auto">
                <button type="submit" className="btn btn-primary">{submitLabel}</button>
                <Link to={`/admin/${slug}`} className="btn btn-light ms-2">Cancel</Link>
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
  const row = activeRow(slug);

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
  const row = activeRow(slug);
  const [active, setActive] = useState((row.status || "Active") === "Active");
  const navigate = useNavigate();

  return (
    <ModalShell slug={slug}>
      <img src={row.image || profile} alt={row.name || row.title} />
      <h3>Status Update</h3>
      <p>{row.name || row.username || row.title || row.productName}</p>
      <p>{row.email || "admin@example.com"}</p>
      <p>{row.phone || "9876543210"}</p>
      <p>Current status: {statusBadge(active ? "Active" : "Inactive")}</p>
      <div className="form-check form-switch d-inline-flex align-items-center gap-2 justify-content-center">
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          checked={active}
          onChange={() => {
            const nextActive = !active;
            setActive(nextActive);
            updateStoredRow(slug, { ...row, status: nextActive ? "Active" : "Inactive" });
          }}
          id="statusSwitch"
        />
        <label className="form-check-label" htmlFor="statusSwitch">
          {active ? "Active" : "Inactive"}
        </label>
      </div>
      <button type="button" className="btn btn-primary mt-2" onClick={() => navigate(`/admin/${slug}`)}>
        Done
      </button>
    </ModalShell>
  );
};
