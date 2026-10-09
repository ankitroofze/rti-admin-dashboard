import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import Select from "react-select";
import swal from "sweetalert";
import API from "../api/api";
import axiosClient from "../api/axiosClient";
import apiClient from "../services/apiClient";
import adminRouteClient from "../services/adminRouteClient";
import adminRtiClient from "../services/adminRtiClient";
import { getAuthToken } from "../services/authSession";
import profile from "../assets/images/profile/profile.png";
import avatar1 from "../assets/images/avatar/1.jpg";
import avatar2 from "../assets/images/avatar/2.jpg";
import avatar3 from "../assets/images/avatar/3.jpg";
import logo from "../assets/images/rti.png";
import qrcode from "../assets/images/qr.png";
import AppToast from "../components/common/AppToast";
import statesDistricts from "../data/statesDistricts.json";
import districtBlocks from "../data/districtBlocks.json";

   const getAllStates = () => statesDistricts.map((s) => s.name);

   const getDistrictsByState = (state) => {
     if (!state) return null;
     const match = statesDistricts.find(
       (s) => s.name.toLowerCase() === String(state).toLowerCase()
     );
     return match ? match.districts : null;
   };

   const getAllStatesWithDistricts = () => statesDistricts;

const indianPhonePattern = "(?!([0-9])\\1{9})[6-9][0-9]{9}";
const emailPattern = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";
const googleMapsPattern = "^https?:\\/\\/(www\\.)?(google\\.[a-z.]+\\/maps|maps\\.app\\.goo\\.gl|goo\\.gl\\/maps).+";
const pdfUrl =
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";



const rowKey = (row = {}) =>
  String(
    row._rowKey ||
    row.id ||
    row.profileId ||
    row.userId ||
    row.transactionId ||
    row.adId ||
    row.title ||
    row.sr ||
    ""
  );

const spoofedFormData = (method, data = {}) => {
  const payload = new FormData();
  if (data instanceof FormData) {
    for (const [key, value] of data.entries()) {
      payload.append(key, value);
    }
  } else {
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        payload.append(key, value);
      }
    });
  }
 payload.append("_method", method);
  return payload;
};

const deletedStorageKey = (slug) => `rti-deleted-${dataSlug(slug)}`;

const getDeletedKeys = (slug) => {
  try {
    const deletedKeys = JSON.parse(localStorage.getItem(deletedStorageKey(slug)) || "[]");
    return Array.isArray(deletedKeys) ? deletedKeys.map((value) => String(value)) : [];
  } catch {
    return [];
  }
};

const saveDeletedKeys = (slug, deletedKeys = []) => {
  localStorage.setItem(deletedStorageKey(slug), JSON.stringify(deletedKeys.filter(Boolean)));
};

const activeRecordKey = (slug) => `rti-active-${dataSlug(slug)}`;

const selectOption = (value) =>
  ({ value, label: value });

const toSelectOptions = (items = []) =>
  items.map(selectOption);

const CustomClearText = () =>
  "clear all";

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

// ISO / Laravel timestamp (2026-10-03T09:10:00.000000Z) -> 03-Oct-2026
const formatIsoDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  const day = String(parsed.getDate()).padStart(2, "0");
  const month = parsed.toLocaleString("en-US", { month: "short" });
  return `${day}-${month}-${parsed.getFullYear()}`;
};

const moneyFormatter = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatMoney = (value) => {
  if (value === undefined || value === null || value === "") return "-";
  const n = Number(value);
  return Number.isFinite(n) ? `₹${moneyFormatter.format(n)}` : String(value);
};

const extractTrailingNumber = (value) => {
  const match = String(value || "").match(/(\d+)(?!.*\d)/);
  return match ? Number(match[1]) : null;
};

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const isWithinLastWeek = (row = {}) => {
  const dateValue = row._createdAtRaw || row.createdAt || row.createdDate || row.created_at || row.created_date;
  if (!dateValue) return true;   // agar date hi nahi mili, to safe side pe dikhne do
  const normalized = String(dateValue).replace("T", " ");
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return true;   // date parse nahi hui to bhi dikhne do
  return Date.now() - parsed.getTime() <= ONE_WEEK_MS;
};

const buildSequentialId = (slug, rows = []) => {
  const prefix = slug === "user-profile" ? "USR"
    : slug === "news" ? "NEWS"
      : slug === "ecom-buy" ? "BUY"
        : slug === "ecom-sell" ? "SELL"
          : slug.toUpperCase().slice(0, 3);
  const numericIds = rows
    .map((row) => extractTrailingNumber(row?.id ?? row?.userId ?? row?.profileId ?? row?.newsId ?? ""))
    .filter((value) => Number.isFinite(value))
    .map((value) => Number(value));
  const nextNumber = numericIds.length ? Math.max(...numericIds) + 1 : 1;
  return `${prefix}-${String(nextNumber).padStart(5, "0")}`;
};
const mergeRowsByKey = (storedRows = [], incomingRows = []) => {
  const merged = [];
  const seen = new Set();
  [...storedRows, ...incomingRows].forEach((row) => {
    const key = rowKey(row);
    if (!key || seen.has(key)) return;
    seen.add(key);
    merged.push(row);
  });
  return merged;
};

// ✅ Naya add hamesha top pe — id (ya date) ke hisaab se newest-first sort
const sortRowsNewestFirst = (rows = []) => {
  return [...rows].sort((a, b) => {
    const idA = extractTrailingNumber(a?.id);
    const idB = extractTrailingNumber(b?.id);
    if (Number.isFinite(idA) && Number.isFinite(idB) && idA !== idB) return idB - idA;
    const dateA = new Date(String(a?._createdAtRaw || a?.createdAt || a?.created_at || 0).replace("T", " ")).getTime() || 0;
    const dateB = new Date(String(b?._createdAtRaw || b?.createdAt || b?.created_at || 0).replace("T", " ")).getTime() || 0;
    return dateB - dateA;
  });
};
const toDateInputValue = (value) => {
  if (!value) return "";
  const parsed = new Date(String(value).replace(/-/g, " "));
  if (Number.isNaN(parsed.getTime())) return "";
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${parsed.getFullYear()}-${month}-${day}`;
};
const stateOptions = getAllStates();

const defaultDistricts = [];
const defaultTalukas = [];
const getDistrictOptions = (state) => (state ? getDistrictsByState(state) || [] : []); // path apni file ki location ke hisaab se adjust karo

const getTalukaOptions = (district) => {
  if (!district) return [];
  const match = districtBlocks.find(
    (d) => d.name.toLowerCase() === String(district).toLowerCase()
  );
  return match ? match.blockList.map((b) => b.name) : [];
};

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

const subscriptionRoles = [
  "Chief Editor / Publisher",         // id 1
  "Executive Editor",                 // id 2
  "Deputy Editor (National)",         // id 3
  "Public Relations Officer (PRO)",   // id 4
  "National Bureau Chief",            // id 5
  "State Chief Editor",               // id 6
  "State Bureau Chief",               // id 7
  "State Coordinator",                // id 8
  "Senior State Correspondent",       // id 9
  "Special State Reporter",           // id 10
  "District Head",                    // id 11
  "District Bureau Chief",            // id 12
  "District Correspondent",           // id 13
  "Senior District Reporter",         // id 14
  "District Coordinator",             // id 15
  "Taluka Head",                      // id 16
  "Taluka Correspondent",             // id 17
  "Sub-Reporter",                     // id 18
  "Taluka Representative",            // id 19
  "Regional Reporter",                // id 20
  "Village Correspondent",            // id 21
  "Village Representative",           // id 22
  "Village Reporter",                 // id 23
  "Public Communication Associate",   // id 24
  "Rural Reporter",                   // id 25
];
const roleIdByLabel = subscriptionRoles.reduce((map, label, index) => {
  map[label] = index + 1;
  return map;
}, {});
const roleLabelById = subscriptionRoles.reduce((map, label, index) => {
  map[index + 1] = label;
  return map;
}, {});

// ✅ NAYA — Premium ek "open" plan hai: isme koi role_id backend ko nahi jayega,
// isliye ye plan sabhi users ko dikhega aur checkout pe sabhi seats open honge.
const OPEN_ROLE_LABEL = "Premium (All Roles - Open)";
const subscriptionRoleOptions = [...subscriptionRoles, OPEN_ROLE_LABEL];

// ✅ NAYA — role label me selected location ka naam inject karta hai
// e.g. "State Chief Editor" + "Maharashtra" -> "Maharashtra Chief Editor"
const localizeRoleLabel = (label, levelWord, locationValue) => {
  if (!locationValue) return label;
  if (levelWord && label.includes(levelWord)) return label.replace(levelWord, locationValue);
  return levelWord ? `${locationValue} ${label}` : label;
};

// ✅ NAYA — location combination se decide karta hai konsa 5-role block aur konsa level-word use hoga
const getRoleLevelInfo = (state, district, taluka, village) => {
  if (state && district && taluka && village) return { start: 20, levelWord: "Village", locationValue: village };
  if (state && district && taluka) return { start: 15, levelWord: "Taluka", locationValue: taluka };
  if (state && district) return { start: 10, levelWord: "District", locationValue: district };
  if (state) return { start: 5, levelWord: "State", locationValue: state };
  return { start: 0, levelWord: "", locationValue: "" };
};

// ✅ NAYA — us block ke 5 roles nikaal ke location-naam ke saath localize karta hai
const getRoleOptionsForLocation = (state, district, taluka, village) => {
  const { start, levelWord, locationValue } = getRoleLevelInfo(state, district, taluka, village);
  const localizedRoles = subscriptionRoles.slice(start, start + 5).map((label) => localizeRoleLabel(label, levelWord, locationValue));
  return { localizedRoles, start };
};

// ✅ NAYA — form se aaya localized label wapas usi role_id (1-25) pe resolve karta hai
const resolveRoleIdFromLocalizedLabel = (record = {}) => {
  const { localizedRoles, start } = getRoleOptionsForLocation(record.state, record.district, record.taluka, record.village);
  const index = localizedRoles.indexOf(String(record.role || "").trim());
  return index >= 0 ? start + index + 1 : "";
};

// "Executive Editor, Pratinidhi" -> "2,6"
const rolesToIds = (roleValue = "") =>
  String(roleValue)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((label) => roleIdByLabel[label] || label)
    .join(",");

const testTypeIdMap = {
  "Practice (20 Q)": 1,
  "Training (50 Q)": 2,
  "Exam (100 Q)": 3,
};

const testTypeLabelById = {
  1: "Practice (20 Q)",
  2: "Training (50 Q)",
  3: "Exam (100 Q)",
};

const generateGroupKey = () => `grp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const users = [];

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
];

const moduleConfig = {
  dashboard: {
    title: "Dashboard",
    add: false,
    stats: [
      ["Total Users", "2", "fa-users", "primary", "all"],
      ["Premium Users", "1", "fa-crown", "warning", "premium"],
      ["Active Users", "1", "fa-user-check", "success", "active"],
      ["Inactive Users", "1", "fa-user-xmark", "danger", "inactive"],
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
    actions: ["view", "update", "status", "delete"],
    details: [
      "userId",
      "firstname",
      "lastname",
      "email",
      "mobileNumber",
      "state",
      "district",
      "taluka",
      "profile_image",
      "referralCode",
      "referredBy",
      "createdDate",
      "status",
    ],
    profileView: true,
      form: "user",  
  },
  "user-profile": {
    title: "User Profile",
    add: false,
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
      "firstname",
      "lastname",
      "email",
      "mobileNumber",
      "state",
      "district",
      "taluka",
      "profile_image",
      "referralCode",
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
  rows: [], // ✅ dummy hata di — ab API se aayega
  columns: [
    ["sr", "Sr.No"],
    ["userId", "User ID"],
    ["username", "Username"],
    ["referralCode", "Referral Code"],
    ["totalReferrals", "Total Referrals"],
    ["rankName", "Rank"],
    ["totalCommission", "Total Commission"],
  ],
    actions: ["view", "delete"],
  details: [
    "userId", "username", "referralCode", "referredBy",
    "totalReferrals", "rankName", "rewardAmount", "totalCommission", "createdDate",
  ],
},

  
  wallets: {
    title: "Wallet",
    add: false,
    filters: ["search"],
    rows: [],
    columns: [
      ["sr", "Sr.No"],
      ["userId", "User ID"],
      ["userName", "User"],
      ["withdrawableBalance", "Withdrawable"],
      ["approvedCommission", "Approved"],
      ["pendingCommission", "Pending"],
      ["withdrawnBalance", "Withdrawn"],
      ["status", "Status"],
    ],
    actions: ["view"],
    details: [
      "userId", "userName", "userEmail", "status", "frozenReason",
      "withdrawableBalance", "approvedCommission", "pendingCommission",
      "reversedCommission", "lockedBalance", "withdrawnBalance", "totalEarned", "createdAt",
    ],
  },
  withdrawal: {
    title: "Withdrawal",
    add: false,
    filters: ["search", "status"],
    rows: [],
    columns: [
      ["sr", "Sr.No"],
      ["withdrawalNumber", "Withdrawal No."],
      ["userName", "User"],
      ["amount", "Amount"],
      ["method", "Method"],
      ["status", "Status"],
    ],
    actions: ["view", "approve", "reject", "delete"], // delete button sirf paid/rejected/cancelled par dikhta hai (ActionButtons)
    details: [
      "withdrawalNumber", "userId", "userName", "amount", "method", "status",
      "accountHolder", "accountNumber", "ifsc", "upiId",
      "payoutReference", "payoutMode", "adminRemarks", "rejectReason",
      "createdAt", "approvedAt", "paidAt",
    ],
  },
  news: {
    title: "News",
    add: true,
    filters: ["search", "status", "category"],
    rows: [],
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
  rows: [],   
  columns: [
  ["sr", "Sr.No"],
  ["title", "Title"],
  ["price", "Price"],
  ["offerPrice", "Offer Price"],
  ["credits", "Credits"],
  ["days", "Days"],
  ["status", "Status"],
],
  actions: ["view", "update", "delete", "status"],
details: ["title", "role", "state", "district", "taluka", "village", "price", "offerPrice", "credits", "days", "description", "status"],
  form: "subscription",
},
  "ecommerce-subscription": {
    title: "Ecom-Subscription",
    add: true,
    filters: ["search", "status"],
    rows: [], // dummy data removed — dynamic API data expected
    columns: [
      ["sr", "Sr.No"],
      // ["sub_id", "Sub ID"],
      ["title", "Subscription Title"],
      ["description", "Description"],
      ["credits", "Credits"],
      ["days", "Days"],
      ["price", "Price"],
      ["offerPrice", "Offer Price"],
      ["status", "Status"],
    ],
    actions: ["view", "update", "delete", "status"],
    details: ["id", "title", "description", "credits", "days", "price", "offerPrice", "status", "createdAt", "updatedAt"],
    // When adding a new subscription, `used_credit` should not be shown in the add form.
    // The form component should omit `used_credit` for Add mode. Keeping it in details for View.
    form: "commerceSubscription",
  },
  "ads-subscription-purchasers": {
    title: "Ads Subscription Purchasers",
    add: false,
    filters: ["search", "status"],
    rows: [],
    columns: [["sr", "Sr.No"], ["username", "User"], ["planTitle", "Plan"], ["amount", "Amount"], ["status", "Payment Status"], ["purchaseDate", "Purchase Date"], ["endDate", "Expiry"]],
    actions: ["view"],
    details: ["id", "username", "userEmail", "planTitle", "amount", "status", "purchaseDate", "startDate", "endDate", "validityStatus", "razorpayOrderId", "razorpayPaymentId", "failureReason"],
  },
  "ecom-subscription-purchasers": {
    title: "Ecom Subscription Purchasers",
    add: false,
    filters: ["search", "status"],
    rows: [],
    columns: [["sr", "Sr.No"], ["username", "User"], ["planTitle", "Plan"], ["amount", "Amount"], ["status", "Payment Status"], ["purchaseDate", "Purchase Date"], ["endDate", "Expiry"]],
    actions: ["view"],
    details: ["id", "username", "userEmail", "planTitle", "amount", "status", "purchaseDate", "startDate", "endDate", "validityStatus", "razorpayOrderId", "razorpayPaymentId", "failureReason"],
  },
  "quiz-subscription-purchasers": {
    title: "Quiz Subscription Purchasers",
    add: false,
    filters: ["search", "status"],
    rows: [],
    columns: [["sr", "Sr.No"], ["username", "User"], ["planTitle", "Plan"], ["credits", "Quiz Count"], ["amount", "Amount"], ["status", "Payment Status"], ["purchaseDate", "Purchase Date"], ["endDate", "Expiry"]],
    actions: ["view"],
    details: ["id", "username", "userEmail", "planTitle", "credits", "days", "amount", "status", "purchaseDate", "startDate", "endDate", "validityStatus", "razorpayOrderId", "razorpayPaymentId", "failureReason"],
  },



  "payment-history": {
  title: "Payment History",
  add: false,
  filters: ["search", "type", "status"],
  rows: [],
  columns: [
    ["sr", "Sr.No"],
    ["id", "Payment ID"],
    ["username", "User"],
    ["type", "Module"],
    ["planTitle", "Plan"],
    ["credits", "Credits"],
    ["purchaseDate", "Purchase Date"],
    ["amount", "Amount"],
    ["status", "Payment Status"],
    ["validityStatus", "Validity"],
  ],
  actions: ["view"],   // read-only ledger — admin update/delete nahi karta
  details: [
    "id", "username", "userEmail", "type", "planTitle",
    "credits", "days", "amount", "status", "validityStatus",
    "purchaseDate", "startDate", "endDate", "razorpayOrderId", "razorpayPaymentId", "failureReason", "seatLocation", "createdAt",
  ],
},


  /* "ecom-buy" module intentionally removed so Buy modules are hidden */
  "ecom-sell": {
    title: "Sell",
    add: true,
    filters: ["search", "status"],
    rows: [], // dummy data removed — dynamic API data expected
    columns: [
      ["sr", "Sr.No"],
      ["user_id", "User ID"],
      ["title", "Product"],
      ["sellerName", "Seller"],
      ["price", "Price"],
      ["status", "Status"],
    ],
    actions: ["view", "update", "delete", "status"],
    details: ["id", "user_id", "title", "sellerName", "contact", "location", "price", "quantity", "description", "status"],
    form: "ecomSell",
  },
  "product-enquiry": {
    title: "Product Enquiry",
    add: false,
    filters: ["search", "status"],
    rows: [], // dummy data removed — dynamic API data expected
      columns: [
      ["id", "Enquiry ID"],
      ["user_id", "User ID"],
      ["productName", "Product Name"],
      ["customerName", "Customer Name"],
      ["date", "Date"],
      ["status", "Status"],
    ],
    actions: ["view", "delete"],
    details: ["id", "user_id", "productName", "customerName", "mobileNumber", "email", "productImage", "message", "dateTime", "status"],
  },
  "e-paper": {
    title: "E-Paper",
    add: true,
    filters: ["search"],
    rows: [], // dummy data removed — dynamic API data expected
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
    rows: [], // dummy data removed — dynamic API data expected
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


  "question-bank": {
  title: "Question Bank",
  add: true,
  filters: ["search", "status"],
  rows: [],
  columns: [
    ["sr", "Sr.No"],
    ["id", "ID"],
    ["question", "Question"],
    ["groupKey", "Group"],
    ["marks", "Marks"],
    ["status", "Status"],
  ],
  actions: ["view", "update", "status", "delete"],
  details: ["id", "quizTypeId", "groupKey", "question", "optionA", "optionB", "optionC", "optionD", "correctAnswer", "explanation", "marks", "status"],
  form: "questionBank",
},


  advertisement: {
    title: "Advertisement",
    add: true,
    filters: ["search", "status"],
    rows: [], // dummy data removed — dynamic API data expected
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
  "ads-subscription": {
    title: "Advertisement Subscription",
    add: true,
    filters: ["search", "status"],
    rows: [], // dummy data removed — dynamic API data expected
    columns: [
      ["sr", "Sr.No"],
      // ["sub_id", "Sub ID"],
      ["title", "Subscription Title"],
      ["description", "Description"],
      ["price", "Price"],
      ["offerPrice", "Offer Price"],
      ["credits", "Credits"],
      ["days", "Days"],
      ["status", "Status"],
    ],
       actions: ["view", "update", "delete", "status"],
    details: ["title", "description", "price", "offerPrice", "credits", "days", "status", "createdAt", "updatedAt"],
    form: "adsSubscription",
  },

  
  "ads-management": {
  title: "Ads Detail",
    add: false, 
  filters: ["search", "status"],
  rows: [],   // ✅ dummy row hata di
  columns: [
    ["sr", "Sr.No"],
    ["adsId", "Ads ID"],
    ["username", "Username"],
    ["subscriptionName", "Subscription Name"],
    ["adsTitle", "Ads Title"],
    ["status", "Status"],
    ["views", "Views"],
    ["startDate", "Start Date"],
  ],
  actions: ["view", "status", "update", "delete"],
  details: [
  "adsId",
  "username",
  "subscriptionName",
  "adsTitle",
  "status",
  "mediaFile",
  "adsDescription",
  "redirection",
  "redirectionUrl",
  "views",
  "startDate",
  "endDate",
],
  form: "adsManagement",
},


  "ads-view-tracking": {
    title: "Ads View Tracking",
    add: false,
    filters: ["search"],
    rows: [], // dummy data removed — dynamic API data expected
    columns: [
      ["sr", "Sr.No"],
      ["viewerName", "Viewer Name"],
      ["adName", "Ad Name"],
      ["adOwner", "Ad Owner"],
      ["viewDate", "View Date"],
      ["device", "Device"],
    ],
    actions: ["view", "delete"],
    details: ["viewerName", "adName", "adOwner", "viewDate", "device", "viewerProfile", "adDetails", "viewCount", "ipDeviceDetails"],
  },
  "reports-product-enquiry": {
    title: "Product Enquiry Reports",
    add: false,
    filters: ["search"],
    rows: [], // dummy data removed — dynamic API data expected
    columns: [
      ["sr", "Sr.No"],
      ["product", "Product"],
      ["totalEnquiries", "Total Enquiries"],
      ["owner", "Owner"],
      ["date", "Date"],
    ],
    actions: ["view", "delete"],
    details: ["product", "totalEnquiries", "owner", "date"],
  },
  "reports-user-wise": {
    title: "User Wise Reports",
    add: false,
    filters: ["search"],
    rows: [], // dummy data removed — dynamic API data expected
    columns: [
      ["sr", "Sr.No"],
      ["user", "User"],
      ["productsAdded", "Products Added"],
      ["totalEnquiries", "Total Enquiries"],
    ],
    actions: ["view", "delete"],
    details: ["user", "productsAdded", "totalEnquiries"],
  },
  "reports-subscription": {
    title: "Subscription Reports",
    add: false,
    filters: ["search"],
    rows: [], // dummy data removed — dynamic API data expected
    columns: [
      ["sr", "Sr.No"],
      ["user", "User"],
      ["plan", "Plan"],
      ["price", "Price"],
      ["days", "Days"],
    ],
    actions: ["view", "delete"],
    details: ["user", "plan", "price", "days"],
  },
  "reports-ads-view": {
    title: "Ads View Reports",
    add: false,
    filters: ["search"],
    rows: [], // dummy data removed — dynamic API data expected
    columns: [
      ["sr", "Sr.No"],
      ["adTitle", "Ad Title"],
      ["totalViews", "Total Views"],
      ["uniqueUsers", "Unique Users"],
    ],
    actions: ["view", "delete"],
    details: ["adTitle", "totalViews", "uniqueUsers"],
  },
  "offices-addresses": {
    title: "Office Address",
    add: true,
    filters: ["search"],
    rows: [], // dummy data removed — dynamic API data expected
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
    rows: [], // dummy data removed — dynamic API data expected
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
    rows: [], // dummy data removed — dynamic API data expected
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
  "user-follows": {
    title: "User Follows",
    add: false,
    filters: ["search"],
    rows: [], // dummy data removed — dynamic API data expected
    columns: [
      ["sr", "Sr.No"],
      ["id", "ID"],
      ["follower_name", "Follower"],
      ["following_name", "Following"],
      ["createdAt", "Followed On"],
    ],
    actions: ["view", "delete"],
    details: ["id", "follower_name", "follower_email", "following_name", "following_email", "createdAt"],
  },
  "user-blocks": {
    title: "User Blocks",
    add: false,
    filters: ["search"],
    rows: [], // dummy data removed — dynamic API data expected
    columns: [
      ["sr", "Sr.No"],
      ["id", "ID"],
      ["blocker_name", "Blocked By"],
      ["blocked_name", "Blocked User"],
      ["createdAt", "Blocked On"],
    ],
    actions: ["view", "delete"],
    details: ["id", "blocker_name", "blocker_email", "blocked_name", "blocked_email", "reason", "createdAt"],
  },
"quiz-subscription-create": {
  title: "Quiz Subscription Plans",
  add: true,
  filters: ["search", "status"],
  rows: [],
  columns: [
    ["sr", "Sr.No"],
    ["id", "ID"],
    ["title", "Title"],
    ["quiz_count", "Quiz Count"],
    ["days", "Days"],
    ["price", "Price"],
    ["offerPrice", "Offer Price"],
    ["status", "Status"],
  ],
  actions: ["view", "update", "status", "delete"],
  details: ["id", "title", "description", "quiz_count", "days", "price", "offerPrice", "status", "createdAt"],
  form: "quizSubscriptionCreate",
},

"quiz-subscription-by-user": {
  title: "Quiz Subscriptions (User Purchases)",
  add: false,
  filters: ["search", "status", "user"],
  rows: [],
  columns: [
    ["sr", "Sr.No"],
    ["id", "ID"],
    ["user_id", "User ID"],
    ["planTitle", "Plan"],
    ["quiz_count", "Quiz Count"],
    ["days", "Days"],
    ["status", "Status"],
  ],
   actions: ["view"], // read-only ledger — API me add/update/delete diya hi nahi hai
  details: ["id", "user_id", "planTitle", "quiz_count", "days", "status", "createdAt"],
  // 👈 "form" key jaan-boojhkar hataya — is module ka koi add/update form nahi hai
},

"quiz-attempts": {
  title: "Quiz Attempts (By User)",
  add: false,
  filters: ["search", "status"],
  rows: [],
  columns: [
    ["sr", "Sr.No"],
    ["id", "Attempt ID"],
    ["user_id", "User ID"],
    ["username", "User"],
    ["quizTitle", "Quiz"],
    ["totalQuestions", "Total Qs"],
    ["correctAnswers", "Correct"],
    ["percentage", "Score %"],
    ["timeTaken", "Time"],
    ["attemptStatus", "Status"],
    ["attemptedAt", "Attempted On"],
  ],
  actions: ["view", "delete"],
  details: [
    "id", "user_id", "username", "userEmail", "userMobile",
    "quizTitle", "quizType",
    "totalQuestions", "attemptedQuestions", "correctAnswers", "wrongAnswers", "skippedAnswers",
    "marks", "percentage", "timeTaken", "attemptStatus", "attemptedAt", "submittedAt",
  ],
},

"profile-update-requests": {
  title: "Profile Update Requests",
  add: false,
  filters: ["search", "status"],
  rows: [], // dummy data removed — dynamic API data expected
  columns: [
    ["sr", "Sr.No"],
    ["user_name", "User Name"],
    ["user_email", "User Email"],
    ["changesSummary", "Changed Field(s)"],
    ["changesValue", "Requested Value"],
    ["requested_at", "Requested Date"],
    ["status", "Status"],
  ],
  actions: ["view", "approve", "reject"],
  details: ["user_name", "user_email", "changesSummary", "changesValue", "pendingProfileImage", "requested_at", "status", "admin_reason"],
}
};

const labels = {
  id: "ID",
  userId: "User ID",
  profileId: "Profile ID",
  firstname: "First Name",
  lastname: "Last Name",
  profile_image: "Profile Image",
  pendingProfileImage: "Pending Profile Image",
  pendingPhone: "Pending Phone",
  pendingBio: "Pending Bio",
  email: "Email",
  mobileNumber: "Mobile Number",
  phone: "Phone",
  state: "State",
  district: "District",
   taluka: "Taluka",
  village: "Village",
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
  quiz_count: "Quiz Count",
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
  groupKey: "Group Key",
  userName: "User",
  userEmail: "Email",
  withdrawableBalance: "Withdrawable Balance (Nikaal sakte hain)",
  approvedCommission: "Approved Commission",
  pendingCommission: "Pending Commission (Approval baaki)",
  reversedCommission: "Reversed Commission (Wapas liya gaya)",
  lockedBalance: "Locked (Withdrawal process me)",
  withdrawnBalance: "Withdrawn (Ab tak mila)",
  totalEarned: "Total Earned",
  frozenReason: "Freeze Reason",
  withdrawalNumber: "Withdrawal No.",
  method: "Method",
  accountHolder: "Account Holder",
  accountNumber: "Account Number",
  ifsc: "IFSC",
  upiId: "UPI ID",
  payoutReference: "Payout Reference (UTR)",
  payoutMode: "Payout Mode",
  adminRemarks: "Admin Remarks",
  rejectReason: "Reject Reason",
  approvedAt: "Approved At",
  planTitle: "Plan",
  validityStatus: "Validity",
  purchaseDate: "Purchase Date",
  startDate: "Start Date",
  endDate: "End Date",
  razorpayOrderId: "Razorpay Order ID",
  razorpayPaymentId: "Razorpay Payment ID",
  failureReason: "Failure Reason",
  seatLocation: "Seat Location",
quizTypeId: "Quiz Type",
  credits: "Credits",
  creditsUsed: "Credits Used",
  creditsLeft: "Credits Left",
  days: "Days",
  startDate: "Start Date",
  endDate: "End Date",
  customerName: "Customer Name",
  ownerName: "Owner Name",
  productImage: "Product Image",
  date: "Date",
  dateTime: "Date & Time",
  user: "User",
  adTitle: "Ad Title",
  views: "Views",
  adDetails: "Ad Details",
  viewerName: "Viewer Name",
  adName: "Ad Name",
  adOwner: "Ad Owner",
  viewDate: "View Date",
  device: "Device",
  viewerProfile: "Viewer User Profile",
  viewCount: "View Count",
  ipDeviceDetails: "IP / Device Details",
  product: "Product",
  totalEnquiries: "Total Enquiries",
  owner: "Owner",
  productsAdded: "Products Added",
  plan: "Plan",
  totalViews: "Total Views",
  uniqueUsers: "Unique Users",
  // Quiz Subscription Create
  subscription_name: "Subscription Name",
  attempts: "Attempts",
  attempts_used: "Attempts Used",
  attempts_left: "Attempts Left",
  subjects: "Subjects",
  startDate: "Start Date",
  endDate: "End Date",
  userName: "User Name",
  subscription_id: "Subscription ID",
  
  // Quiz Subscription By User
  user_id: "User ID",
  subscription_name: "Subscription Name",
  subject: "Subject",
  timeLimit: "Time Limit (Minutes)",
  user_name: "User Name",
  user_email: "User Email",
  changesSummary: "Changed Field(s)",
  changesValue: "Requested Value",
  requested_at: "Requested Date",
  admin_reason: "Admin Reason",

  adsId: "Ads ID",
username: "Username",
subscriptionName: "Subscription Name",
adsTitle: "Ads Title",
adsDescription: "Ads Description",

adsSubId: "Ads Subscription",
redirection: "Redirection",
redirectionUrl: "Redirection URL",
};
Object.assign(labels, {
  userMobile: "Mobile",
  quizType: "Quiz Type",
  attemptedQuestions: "Attempted Qs",
  wrongAnswers: "Wrong",
  skippedAnswers: "Skipped",
  timeTaken: "Time Taken",
  attemptStatus: "Status",
  attemptedAt: "Attempted On",
  submittedAt: "Submitted At",
  quizTitle: "Quiz",
  totalQuestions: "Total Questions",
  correctAnswers: "Correct Answers",
  percentage: "Score %",
});

const profileFieldLabels = {
  name: "Name",
  email: "Email",
  bio: "Bio",
  contact_number: "Phone Number",
  phone_number: "Phone Number",
  mobile_number: "Phone Number",
  phone: "Phone Number",
  profile_image: "Profile Image",
};

const summarizeProfileUpdateRequest = (row = {}, index = 0) => {
  // "-" / khali values ko skip karke pehli real value uthata hai
  const pick = (...values) => values.find((v) => v !== undefined && v !== null && v !== "" && v !== "-");
  const fullNameOf = (person = {}) => [person.firstname, person.lastname].filter(Boolean).join(" ").trim();
  const nested = row.user || {};

  // requested values: ya to requested_updates object, ya pending_* fields (pending_name, pending_bio, pending_phone ...)
  const requested = { ...(row.requested_updates || row.requestedUpdates || row.pending_updates || {}) };
  Object.entries(row).forEach(([key, value]) => {
    if (!key.startsWith("pending_") || /(_url|image|photo)$/.test(key)) return;
    if (value === null || value === undefined || value === "") return;
    requested[key.replace(/^pending_/, "")] = value;
  });

  const seenLabels = new Set();
  const labelsList = [];
  const valuesList = [];
  Object.entries(requested).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    const label = profileFieldLabels[key] || key.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
    if (seenLabels.has(label)) return;
    seenLabels.add(label);
    labelsList.push(label);
    valuesList.push(typeof value === "object" ? JSON.stringify(value) : String(value));
  });

  const rawStatus = String(pick(row.profile_update_status, row.approval_status, row.status) || "Pending").trim().toLowerCase();
  const status = rawStatus === "approved" ? "Approved" : rawStatus === "rejected" ? "Rejected" : "Pending";
  const userId = pick(row.user_id, row.userId, row.id) || "";
  return {
    ...row,
    _rowKey: String(userId || row._rowKey || `profile-update-${index}`),
    sr: row.sr || index + 1,
    id: userId || `profile-update-${index}`,
    user_id: userId,
    user_name: pick(row.user_name, row.userName, row.name, fullNameOf(row), nested.name, fullNameOf(nested)) || "-",
    user_email: pick(row.user_email, row.userEmail, row.email, nested.email) || "-",
    requested_updates: requested,
    changesSummary: labelsList.join(", ") || "-",
    changesValue: valuesList.join(", ") || "-",
    pendingProfileImage: absoluteStorageUrl(pick(row.pending_profile_image_url, row.pending_profile_image)) || "",
    requested_at: formatDisplayDate(pick(row.requested_at, row.requestedAt, row.pending_requested_at, row.profile_update_requested_at, row.updated_at)) || "-",
    status,
    admin_reason: row.admin_reason || row.adminReason || "",
  };
};


const requestStatusBadge = (status) => {
  const normalized = String(status || "Pending").trim().toLowerCase();
  const map = {
    pending: ["warning", "Pending"],
    approved: ["success", "Approved"],
    paid: ["success", "Paid"],
    active: ["success", "Active"],
    processing: ["info", "Processing"],
    rejected: ["danger", "Rejected"],
    cancelled: ["secondary", "Cancelled"],
    frozen: ["danger", "Frozen"],
  };
  const [variant, label] = map[normalized] || ["warning", normalized.charAt(0).toUpperCase() + normalized.slice(1)];
  return <span className={`badge light badge-${variant}`}>{label}</span>;
};

const getConfig = (slug) => {
  const config = moduleConfig[slug];
  if (!config) {
    console.warn(`No config found for slug: ${slug}, falling back to dashboard`);
  }
    const resolved = config || moduleConfig.dashboard;
  if (resolved.form === "user" && Array.isArray(resolved.details) && !resolved.details.includes("village")) {
    return { ...resolved, details: resolved.details.flatMap((f) => (f === "taluka" ? ["taluka", "village"] : [f])) };
  }
  return resolved;
};

const dataSlug = (slug) => slug === "dashboard" ? "user-profile" : slug;
const storageKey = (slug) => `rti-module-${dataSlug(slug)}`;

const USER_API_SLUGS = ["dashboard", "user-profile"];
// ✅ Correct - No extra space
// const MODULE_API_SLUGS = ["news", "quiz", "ecommerce-subscription", "ads-subscription"];
// const MODULE_API_SLUGS = ["news", "quiz", "ecommerce-subscription", "ads-subscription", "subscription-plan", "ecom-sell", "product-enquiry", "ads-management"]
const MODULE_API_SLUGS = [
  "news", "quiz", "ecommerce-subscription", "ads-subscription",
  "subscription-plan", "ecom-sell", "product-enquiry", "ads-management",
  "reports-product-enquiry", "reports-user-wise", "reports-subscription", "reports-ads-view",
  "e-paper", "advertisement", "wallets", "withdrawal", "offices-addresses",
  "news-notification", "contact-us", "ads-view-tracking",
  "quiz-subscription-create", "quiz-subscription-by-user", "quiz-attempts",
  "question-bank",
  "network",                    // ✅ FIX: pehle missing tha, isliye fetch effect chalta hi nahi tha
  "user-follows", "user-blocks", "profile-update-requests", // ✅ NAYA — Admin RTI live APIs
];
const PAYMENT_LIST_SLUGS = ["payment-history", "ads-subscription-purchasers", "ecom-subscription-purchasers", "quiz-subscription-purchasers"];
MODULE_API_SLUGS.push(...PAYMENT_LIST_SLUGS);
const PURCHASER_TYPE = { "ads-subscription-purchasers": "ads", "ecom-subscription-purchasers": "ecom", "quiz-subscription-purchasers": "quiz" };
const PURCHASER_SLUGS = Object.keys(PURCHASER_TYPE);
const LIVE_API_SLUGS = [...USER_API_SLUGS, ...MODULE_API_SLUGS];

const moduleApi = {
  "ads-subscription-purchasers": {
    index: API.ADS_SUBSCRIPTION_PURCHASERS_INDEX,
    planIndex: API.ADS_SUBSCRIPTION_PLAN_PURCHASERS,
    singular: "purchaser",
    collection: "purchasers",
  },
  "ecom-subscription-purchasers": {
    index: API.ECOM_SUBSCRIPTION_PURCHASERS_INDEX,
    planIndex: API.ECOM_SUBSCRIPTION_PLAN_PURCHASERS,
    singular: "purchaser",
    collection: "purchasers",
  },
  "quiz-subscription-purchasers": {
    index: API.QUIZ_SUBSCRIPTION_PURCHASERS_INDEX,
    planIndex: API.QUIZ_SUBSCRIPTION_PLAN_PURCHASERS,
    singular: "purchaser",
    collection: "purchasers",
  },
  news: {
    index: API.NEWS_INDEX,
    add: API.NEWS_ADD,
    show: API.NEWS_SHOW,
    update: API.NEWS_UPDATE,
    delete: API.NEWS_DELETE,
    status: API.NEWS_STATUS,
  },
  quiz: {
    index: API.QUIZ_INDEX,
    add: API.QUIZ_ADD,
    show: API.QUIZ_SHOW,
    update: API.QUIZ_UPDATE,
    delete: API.QUIZ_DELETE,
    restore: API.QUIZ_RESTORE,
    status: API.QUIZ_STATUS, 
  },
  "ecommerce-subscription": {
    index: API.ECOM_SUBSCRIPTION_INDEX,
    add: API.ECOM_SUBSCRIPTION_ADD,
    show: API.ECOM_SUBSCRIPTION_SHOW,
    update: API.ECOM_SUBSCRIPTION_UPDATE,
    delete: API.ECOM_SUBSCRIPTION_DELETE,
    status: API.ECOM_SUBSCRIPTION_STATUS,
    singular: "ecom_subscription",
    collection: "ecom_subscriptions",
  },

  "payment-history": {
  index: API.PAYMENT_HISTORY_INDEX,
  singular: "payment",
  collection: "payments",
},
  "ads-subscription": {
    index: API.ADS_SUBSCRIPTION_INDEX,
    add: API.ADS_SUBSCRIPTION_ADD,
    show: API.ADS_SUBSCRIPTION_SHOW,
    update: API.ADS_SUBSCRIPTION_UPDATE,
    delete: API.ADS_SUBSCRIPTION_DELETE,
    status: API.ADS_SUBSCRIPTION_STATUS,
    singular: "ads_subscription",
    collection: "ads_subscriptions",
  },

"quiz-subscription-create": {
  index: API.QUIZ_SUBSCRIPTION_PLAN_INDEX,
  add: API.QUIZ_SUBSCRIPTION_PLAN_ADD,
  show: API.QUIZ_SUBSCRIPTION_PLAN_SHOW,
  update: API.QUIZ_SUBSCRIPTION_PLAN_UPDATE,
  delete: API.QUIZ_SUBSCRIPTION_PLAN_DELETE,
  status: API.QUIZ_SUBSCRIPTION_PLAN_STATUS,
  restore: API.QUIZ_SUBSCRIPTION_PLAN_RESTORE,
  singular: "plan",
  collection: "plans",
},
"quiz-subscription-by-user": {
  index: API.QUIZ_SUBSCRIPTIONS_INDEX,
  singular: "quiz_subscription",
  collection: "quiz_subscriptions",
},
"quiz-attempts": {
  index: API.QUIZ_ATTEMPTS_INDEX,
  delete: API.QUIZ_ATTEMPTS_DELETE,   // DELETE /quiz-attempts/{attemptId}
  // show hata diya: list response me saari details aati hain, detail page cached row se khulta hai
  singular: "quiz_attempt",
  collection: "quiz_attempts",
},



    network: {
  index: API.REFERRAL_ADMIN_INDEX,
  show: API.REFERRAL_ADMIN_SHOW,
  delete: API.REFERRAL_ADMIN_DELETE,
  singular: "referral",
  collection: "referrals",
},

  "question-bank": {
  index: API.QUESTION_ANS_INDEX,
  byQuizType: API.QUESTION_ANS_BY_QUIZ_TYPE,
  add: API.QUESTION_ANS_ADD,
  update: API.QUESTION_ANS_UPDATE,
  delete: API.QUESTION_ANS_DELETE,
  restore: API.QUESTION_ANS_RESTORE,
  singular: "question",
  collection: "questions",
},
  
  "ads-management": {
  index: API.ADS_DETAIL_INDEX,
  add: API.ADS_DETAIL_ADD,
  show: API.ADS_DETAIL_SHOW,
  update: API.ADS_DETAIL_UPDATE,
  delete: API.ADS_DETAIL_DELETE,
  status: API.ADS_DETAIL_STATUS,
  restore: API.ADS_DETAIL_RESTORE,
  singular: "ads_detail",
  collection: "ads_details",
},
// "ads-management": {
//   index: API.ADS_DETAIL_INDEX,
//   add: API.ADS_DETAIL_ADD,
//   show: API.ADS_DETAIL_SHOW,
//   update: API.ADS_DETAIL_UPDATE,
//   delete: API.ADS_DETAIL_DELETE,
//   status: API.ADS_DETAIL_STATUS,
//   restore: API.ADS_DETAIL_RESTORE,
//   singular: "ads_detail",
//   collection: "ads_details",
// },
"subscription-plan": {
  index: API.SUBSCRIPTION_PLAN_INDEX,
  add: API.SUBSCRIPTION_PLAN_ADD,
  show: API.SUBSCRIPTION_PLAN_SHOW,
  update: API.SUBSCRIPTION_PLAN_UPDATE,
  delete: API.SUBSCRIPTION_PLAN_DELETE,
  status: API.SUBSCRIPTION_PLAN_STATUS,
  restore: API.SUBSCRIPTION_PLAN_RESTORE,
  singular: "subscription_plan",
  collection: "subscription_plans",
},
"ecom-sell": {
  index: API.ECOM_DETAIL_INDEX,
  add: API.ECOM_DETAIL_ADD,
  show: API.ECOM_DETAIL_SHOW,
  update: API.ECOM_DETAIL_UPDATE,
  delete: API.ECOM_DETAIL_DELETE,
  status: API.ECOM_DETAIL_STATUS,
  singular: "ecom_detail",
  collection: "ecom_details",
},
"product-enquiry": {
  index: API.ECOM_ENQUIRY_INDEX,
  show: API.ECOM_ENQUIRY_SHOW,
  status: API.ECOM_ENQUIRY_STATUS,
  delete: API.ECOM_ENQUIRY_DELETE,
  singular: "ecom_enquiry",
  collection: "ecom_enquiries",
},

"reports-product-enquiry": {
  index: API.REPORTS_PRODUCT_ENQUIRY_INDEX,
  delete: API.REPORTS_PRODUCT_ENQUIRY_DELETE,
  singular: "report",
  collection: "reports",
},
"reports-user-wise": {
  index: API.REPORTS_USER_WISE_INDEX,
  delete: API.REPORTS_USER_WISE_DELETE,
  singular: "report",
  collection: "reports",
},
"reports-subscription": {
  index: API.REPORTS_SUBSCRIPTION_INDEX,
  delete: API.REPORTS_SUBSCRIPTION_DELETE,
  singular: "report",
  collection: "reports",
},
"reports-ads-view": {
  index: API.REPORTS_ADS_VIEW_INDEX,
  delete: API.REPORTS_ADS_VIEW_DELETE,
  singular: "report",
  collection: "reports",
},

adsViews: {
  index: "/ads-views",
  totals: "/ads-views/totals",
  show: (id) => `/ads-views/${id}`,
}
,

"e-paper": {
  index: API.EPAPER_INDEX, add: API.EPAPER_ADD, show: API.EPAPER_SHOW,
  update: API.EPAPER_UPDATE, delete: API.EPAPER_DELETE,
  singular: "e_paper", collection: "e_papers",
},

advertisement: {
  index: API.AD_INDEX, add: API.AD_ADD, show: API.AD_SHOW,
  update: API.AD_UPDATE, delete: API.AD_DELETE, status: API.AD_STATUS,
  singular: "advertisement", collection: "advertisements",
},
wallets: { index: API.WALLET_INDEX, show: API.WALLET_SHOW, singular: "wallet", collection: "wallets" },
withdrawal: { index: API.WITHDRAWAL_INDEX, show: API.WITHDRAWAL_SHOW, delete: API.WITHDRAWAL_DELETE, singular: "withdrawal", collection: "withdrawals" },
"offices-addresses": {
  index: API.OFFICE_INDEX, add: API.OFFICE_ADD, show: API.OFFICE_SHOW,
  update: API.OFFICE_UPDATE, delete: API.OFFICE_DELETE,
  singular: "office", collection: "offices",
},
"news-notification": {
  index: API.NOTIFICATION_INDEX, add: API.NOTIFICATION_ADD, delete: API.NOTIFICATION_DELETE,
  singular: "notification", collection: "notifications",
},
"contact-us": { index: API.CONTACT_INDEX, delete: API.CONTACT_DELETE, singular: "contact", collection: "contacts" },
"ads-view-tracking": {
  index: API.ADS_VIEW_TRACKING_INDEX, delete: API.ADS_VIEW_TRACKING_DELETE,
  singular: "ads_view", collection: "ads_views",
},
"user-follows": {
  index: API.USER_FOLLOWS_INDEX, delete: API.USER_FOLLOWS_DELETE,
  singular: "user_follow", collection: "user_follows",
},
"user-blocks": {
  index: API.USER_BLOCKS_INDEX, delete: API.USER_BLOCKS_DELETE,
  singular: "user_block", collection: "user_blocks",
},
"profile-update-requests": {
  index: API.PROFILE_UPDATE_REQUESTS_INDEX,
  approve: API.PROFILE_UPDATE_REQUESTS_APPROVE,
  reject: API.PROFILE_UPDATE_REQUESTS_REJECT,
  singular: "profile_update_request", collection: "profile_update_requests",
},
};
const resolveRecordIdentifier = (rowOrId) => {
  if (typeof rowOrId === "string") return rowOrId;
  if (rowOrId && typeof rowOrId === "object") {
    return String(
      rowOrId?.id ||              // 👈 real id ab sabse pehle check hoga
      rowOrId?.newsId ||
      rowOrId?.news_id ||
      rowOrId?.quizId ||
      rowOrId?.quiz_id ||
      rowOrId?.userId ||
      rowOrId?.profileId ||
      rowOrId?.transactionId ||
      rowOrId?.adId ||
      rowOrId?._rowKey ||          // 👈 sirf fallback, real id na mile tabhi use hoga
      rowKey(rowOrId) ||
      ""
    );
  }
  return "";
};
// const endpoint = (url, rowOrId) => {
//   const id = resolveRecordIdentifier(rowOrId);
//   if (typeof url === "function") return url(encodeURIComponent(id || ""));
//   return String(url || "").replace("{user}", encodeURIComponent(id || ""));
// };

const endpoint = (url, rowOrId) => {
  const id = resolveRecordIdentifier(rowOrId);
  if (!id) {
    throw new Error("Record ID missing — cannot call API. Row data is incomplete.");
  }
  if (typeof url === "function") return url(encodeURIComponent(id));
  return String(url || "").replace("{user}", encodeURIComponent(id));
};

const apiHeaders = () => {
  const token = getAuthToken();
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const buildMultipartHeaders = () => ({
  ...apiHeaders(),
  "Content-Type": "multipart/form-data",
});
const SUBSCRIPTION_API_SLUGS = ["ecommerce-subscription", "ads-subscription"];
// const SUBSCRIPTION_API_SLUGS = ["ecommerce-subscription", "ads-subscription", "subscription-plan"];
const isSubscriptionApiSlug = (slug) => SUBSCRIPTION_API_SLUGS.includes(slug);
const ADMIN_RTI_API_SLUGS = ["user-follows", "user-blocks", "profile-update-requests", "wallets", "withdrawal"];
const isAdminRtiApiSlug = (slug) => ADMIN_RTI_API_SLUGS.includes(slug);
const moduleClientForSlug = (slug) =>
  slug === "news" ? axiosClient
  : isAdminRtiApiSlug(slug) ? adminRtiClient
  : isSubscriptionApiSlug(slug) ? adminRouteClient
  : apiClient;

const apiMessage = (errorOrResponse, fallback = "Something went wrong") => {
  const data = errorOrResponse?.response?.data || errorOrResponse?.data || errorOrResponse;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.errors && typeof data.errors === "object") {
    const allMessages = Object.values(data.errors).flat().filter(Boolean);
    if (allMessages.length) return allMessages.join(" | ");   // ✅ sab errors ek saath
  }
  if (data.message) return data.message;
  if (data.error) return data.error;
  return fallback;
};

const isMissingApiRoute = (error) =>
  [404, 405].includes(error?.response?.status) &&
  (String(error.response?.data?.message || "").toLowerCase().includes("route") ||
    String(error.response?.data?.message || "").toLowerCase().includes("method not allowed") ||
    String(error.response?.statusText || "").toLowerCase().includes("method not allowed"));

const readPath = (source, path) =>
  path.split(".").reduce((value, key) => value?.[key], source);

const extractRows = (payload) => {
  const paymentRows = [
    payload?.payments?.data, payload?.data?.payments?.data, payload?.payments, payload?.data?.payments,
    payload?.purchasers?.data, payload?.data?.purchasers?.data, payload?.purchasers, payload?.data?.purchasers,
  ].find(Array.isArray);
  if (paymentRows) return paymentRows;
  
  const candidates = [
    payload?.ecom_enquiries,
    payload?.ecom_details,
    payload?.data?.ecom_details,
    payload?.data?.ecom_enquiries,
    payload?.users,
    payload?.news,
    payload?.quiz,
    payload?.quizzes,
    payload?.quiz_types,
    payload?.quizTypes,
       payload?.ecom_subscriptions,
    payload?.ecomSubscriptions,
    payload?.quiz_attempts,
    payload?.data?.quiz_attempts,
    payload?.ads_subscriptions,
    payload?.adsSubscriptions,
    payload?.data?.users,
    payload?.data?.news,
    payload?.data?.quiz,
     payload?.questions,
  payload?.data?.questions,
    payload?.data?.quizzes,
    payload?.data?.quiz_types,
    payload?.data?.quizTypes,
    payload?.data?.ecom_subscriptions,
    payload?.data?.ecomSubscriptions,
    payload?.data?.ads_subscriptions,
    payload?.data?.adsSubscriptions,
   payload?.data?.recent_users,
    payload?.data?.recentUsers,
    payload?.quiz_subscription_plans,
    payload?.data?.quiz_subscription_plans,
      payload?.quiz_subscriptions,              // 👈 ADD KARO
    payload?.data?.quiz_subscriptions,        // 👈 ADD KARO
    payload?.plans,
    payload?.data?.plans,
    payload?.data?.list,
    payload?.data?.data,
    payload?.records,
    payload?.data,
    payload,
   payload?.subscription_plans,        
    payload?.data?.subscription_plans,  
     payload?.ads_details,
    payload?.data?.ads_details,
    payload?.role_subscription_plans,          // 👈 add
    payload?.data?.role_subscription_plans,     // 👈 add
      payload?.referrals,                         // ✅ NEW: /admin/referrals list ke liye
    payload?.data?.referrals,
    payload?.follows,                           // ✅ NEW: user-follows list ke liye
    payload?.data?.follows,
    payload?.blocks,                            // ✅ NEW: user-blocks list ke liye
    payload?.data?.blocks,
    payload?.wallets?.data,
    payload?.data?.wallets?.data,
    payload?.wallets,
    payload?.data?.wallets,
    payload?.transactions?.data,                // wallets: paginated transactions
    payload?.data?.transactions?.data,
    payload?.transactions,
    payload?.data?.transactions,
    payload?.withdrawals?.data,                 // withdrawals: paginated list
    payload?.data?.withdrawals?.data,
    payload?.withdrawals,
    payload?.data?.withdrawals,
    payload?.pending_profiles,                  // pending-profiles list
    payload?.data?.pending_profiles,
    payload?.profiles,
    payload?.data?.profiles,
    payload?.requests,
    payload?.data?.requests,
  ];
  return candidates.find(Array.isArray) || [];
};

const normalizeStatus = (value) => {
  if (typeof value === "boolean") return value ? "Active" : "Inactive";
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "1" || normalized === "active" || normalized === "approved" || normalized === "paid" || normalized === "true") return "Active";
  if (normalized === "0" || normalized === "2" || normalized === "inactive" || normalized === "pending" || normalized === "failed" || normalized === "rejected" || normalized === "false") return "Inactive";
  return value || "Active";
};
const normalizeStatusValue = (value) => {
  if (typeof value === "boolean") return value ? 1 : 0;
  if (Number(value) === 1) return 1;
  if (Number(value) === 0) return 0;
  const normalized = String(value || "Active").trim().toLowerCase();
  if (["active", "approved", "paid", "true", "1"].includes(normalized)) return 1;
  return 0;
};
const STORAGE_BASE = "https://rtiapi.roofze.in/storage/";
const absoluteStorageUrl = (path) => {
  const value = String(path || "").trim();
  if (!value) return "";
  if (/^(https?:|data:|blob:|\/)/i.test(value)) return value;
  return STORAGE_BASE + value.replace(/^\/+/, "");
};
const resolveLocationValue = (value, key) => {
  if (value && typeof value === "object") {
    return value[key] ?? value.name ?? value.title ?? value.label ?? "";
  }
  return value ?? "";
};
const isDeletedRow = (row = {}) => {
  if (row.deleted_at || row.deletedAt || row.trashed) return true;
  if (row.is_deleted === undefined || row.is_deleted === null || row.is_deleted === "") return false;
  if (typeof row.is_deleted === "boolean") return !row.is_deleted; // agar true = active, false = deleted
  return Number(row.is_deleted) === 0;   // ✅ 0 = deleted, 1 = active (aapke convention ke hisaab se)
};
const isStaticDummyRow = (row = {}) => {
  const dummyTokens = [row.name, row.username, row.user, row.ownerName, row.adOwner, row.title, row.productName, row.officeName]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return dummyTokens.includes("amit sharma") || dummyTokens.includes("new record");
};

const normalizeUserRow = (row = {}, index = 0) => {
 const image = absoluteStorageUrl(row.profile_image_url || row.profileImageUrl) || absoluteStorageUrl(row.image) || absoluteStorageUrl(row.profile_image || row.profileImage || row.avatar || row.photo) || profile;
  const rawName = row.name || row.full_name || row.fullName || row.username || row.title || "User";
  // const firstname = row.firstname || row.first_name || row.firstName || rawName;
  // const lastname = row.lastname || row.last_name || row.lastName || "";
  const firstname = row.firstname || row.first_name || row.firstName || (rawName.split(" ")[0] || "");
const lastname = row.lastname || row.last_name || row.lastName || (rawName.split(" ").slice(1).join(" ") || "");
  const name = row.name || [firstname, lastname].filter(Boolean).join(" ").trim() || rawName;
  const phone = row.phone || row.mobile || row.mobile_number || row.mobileNumber || "";
  const id = row.id || row.user_id || row.userId || row.profile_id || row.profileId || "";
  return {
    ...row,
    _rowKey: String(id || rowKey(row) || `user-${index}`),
       _createdAtRaw: row._createdAtRaw || row.createdAt || row.created_at || row.createdDate || row.created_date || "", 
    sr: row.sr || index + 1,
    id,
    userId: row.userId || row.user_id || id,
    profileId: row.profileId || row.profile_id || row.user_id || id,
    image,
    firstname,
    lastname,
    name,
    profile_image: row.profile_image || row.profileImage || "",
    pendingProfileImage: absoluteStorageUrl(row.pending_profile_image_url || row.pending_profile_image),
    pendingPhone: row.pending_phone || "",
    pendingBio: row.pending_bio || "",
    username: row.username || name,
    email: row.email || "",
    phone,
    mobileNumber: row.mobileNumber || row.mobile_number || row.mobile || phone,
    state: resolveLocationValue(row.state, "state"),
    district: resolveLocationValue(row.district, "district"),
 taluka: resolveLocationValue(row.taluka, "taluka") || row.taluka_name || "",
    village: resolveLocationValue(row.village, "village") || row.village_name || "",
    referralCode: row.referralCode || row.referral_code || "",
    referredBy: row.referredBy || row.referred_by || "",
    createdDate: formatDisplayDate(row.createdDate || row.created_at || row.createdAt) || "",
    createdAt: formatDisplayDate(row.createdAt || row.created_at) || "",
    updatedAt: formatDisplayDate(row.updatedAt || row.updated_at) || "",
    status: normalizeStatus(row.status ?? row.is_active ?? row.active),
    userType: row.userType || row.user_type || row.type || "",
  // ✅ NEW: user ka active role subscription — backend jo bhi shape bheje
    // (subscription_plan / role_subscription object, ya flat fields), sabse try karte hain
    planName: row.planName || row.plan_name || row.subscription_plan?.plan_name || row.subscription_plan?.title || row.role_subscription?.plan_name || row.role_subscription?.title || "",
    subscriptionDate: formatDisplayDate(
      row.subscriptionDate || row.subscription_date
      || row.subscription_plan?.purchased_at || row.subscription_plan?.created_at
      || row.role_subscription?.purchased_at || row.role_subscription?.created_at
    ) || "",
    subscriptionStatus: normalizeStatus(
      row.subscriptionStatus || row.subscription_status
      || row.subscription_plan?.status || row.role_subscription?.status
      || (row.is_subscribed !== undefined ? row.is_subscribed : "")
    ),
    bio: row.bio || row.description || "",
  };
};
const normalizeQuizQuestions = (row = {}) => {
  const questions = row.questions || row.quiz_questions || row.quizQuestions || row.question_list || [];
  if (Array.isArray(questions) && questions.length) {
    return questions.map((question) => ({
      ...question,
      question: question.question || question.title || question.name || "",
      marks: question.marks || question.mark || "",
      optionA: question.optionA || question.option_a || question.a || "",
      optionB: question.optionB || question.option_b || question.b || "",
      optionC: question.optionC || question.option_c || question.c || "",
      optionD: question.optionD || question.option_d || question.d || "",
      correctAnswer: question.correctAnswer || question.correct_answer || question.answer || "",
      explanation: question.explanation || question.reason || "",
    }));
  }
  return [];
};
const normalizeModuleRow = (slug) => (row = {}, index = 0) => {
  const id = row.id || row.news_id || row.newsId || row.quiz_id || row.quizId || row.quiz_type_id || row.quizTypeId || row.subscription_id || row.subscriptionId || "";
  const questions = normalizeQuizQuestions(row);
  const image = row.image || row.media_url || row.productImage || row.product_image || row.mediaFileUrl || row.media_file_url || row.thumbnail || "";
  const sellerName = row.sellerName || row.seller_name || row.name || row.username || "";
  const productId = row.productId || row.product_id || row.productID || "";
  const userId = row.userId || row.user_id || row.profileId || "";

  // ✅ NEWS — ye naya block add karo (existing quiz-subscription blocks ke baad)
  if (slug === "news") {
    const author = [row.user?.firstname, row.user?.lastname].filter(Boolean).join(" ").trim()
      || row.author || "";
    const normalized = String(row.status ?? "").trim().toLowerCase();
    const status = normalized === "pending" ? "Pending"
      : ["1", "active", "approved"].includes(normalized) ? "Active"
      : "Inactive";

    return {
      ...row,
      _rowKey: String(row.id || `news-${index}`),
      sr: row.sr || index + 1,
      id: row.id || "",
     title: row.tittle || row.title || "Untitled",
      author,
      category: row.report_type || row.category || "",
      mediaFile: row.media_file || row.mediaFile || "",
      mediaFileUrl: row.media_url || row.mediaFileUrl || "",
      status,
      createdAt: formatDisplayDate(row.created_at) || "",
      createdDate: formatDisplayDate(row.created_at) || "",
      updatedAt: formatDisplayDate(row.updated_at) || "",
      description: row.description || "",
      isDeleted: Number(row.is_deleted) === 1,
    };
  }
  if (slug === "subscription-plan") {
    const roleIdRaw = row.role_id ?? row.roleId ?? "";
    const baseRoleLabel = roleIdRaw ? (roleLabelById[Number(roleIdRaw)] || roleLabelById[roleIdRaw] || "") : "";
    const { levelWord, locationValue } = getRoleLevelInfo(row.state, row.district, row.taluka, row.village);
  const roleLabel = baseRoleLabel ? localizeRoleLabel(baseRoleLabel, levelWord, locationValue) : OPEN_ROLE_LABEL;
  return {
    ...row,
    _rowKey: String(row.id || `subplan-${index}`),
    sr: row.sr || index + 1,
    id: row.id || "",
    role: roleLabel,
    role_id: roleIdRaw,
    title: row.title || `Plan #${row.id || index + 1}`,   // 👈 sirf actual title, roleLabel fallback hata do
    state: resolveLocationValue(row.state, "state"),
    district: resolveLocationValue(row.district, "district"),
       taluka: resolveLocationValue(row.taluka, "taluka"),
    village: row.village || "",
    price: row.price || "",
    offerPrice: row.offer_price || row.offerPrice || "",
    credits: row.credits || "",
    days: row.days || "",
    description: row.description || "",
    status: normalizeStatus(row.status ?? row.is_active ?? row.active),
    createdAt: formatDisplayDate(row.createdAt || row.created_at) || "",
    updatedAt: formatDisplayDate(row.updatedAt || row.updated_at) || "",
  };
}

if (slug === "question-bank") {
  const options = Array.isArray(row.option) ? row.option : [];
  return {
    ...row,
    _rowKey: String(row.id || `question-${index}`),
    sr: row.sr || index + 1,
    id: row.id || "",
    quizTypeId: row.quiz_type_id ?? row.quizTypeId ?? "",
    groupKey: row.group_key || row.groupKey || "",
    question: row.question || "",
    optionA: options[0] ?? row.optionA ?? "",
    optionB: options[1] ?? row.optionB ?? "",
    optionC: options[2] ?? row.optionC ?? "",
    optionD: options[3] ?? row.optionD ?? "",
    correctAnswer: row.correct_ans ?? row.correctAnswer ?? "",
    explanation: row.explation ?? row.explanation ?? "",
    marks: row.marks || "",
    status: normalizeStatus(row.status ?? row.is_active ?? row.active),
    isDeleted: isDeletedRow(row),
    createdAt: formatDisplayDate(row.createdAt || row.created_at) || "",
    updatedAt: formatDisplayDate(row.updatedAt || row.updated_at) || "",
    // 👇 NAYA — QuizQuestions component isi array se hidden id input populate karta hai
    questions: [{
      id: row.id || "",
      question: row.question || "",
      optionA: options[0] ?? row.optionA ?? "",
      optionB: options[1] ?? row.optionB ?? "",
      optionC: options[2] ?? row.optionC ?? "",
      optionD: options[3] ?? row.optionD ?? "",
      correctAnswer: row.correct_ans ?? row.correctAnswer ?? "",
      explanation: row.explation ?? row.explanation ?? "",
      marks: row.marks || "",
    }],
  };
}

if (slug === "ecom-sell") {
  const sellerFullName = [row.user?.firstname, row.user?.lastname].filter(Boolean).join(" ").trim();
  return {
    ...row,
    _rowKey: String(row.id || `ecom-sell-${index}`),
    sr: row.sr || index + 1,
    id: row.id || "",
    user_id: row.user_id || "",
    ecomSubId: row.ecom_sub_id || "",
    title: row.product_name || row.title || "-",
    productName: row.product_name || "",
    // backend "seller_name" flat field nahi bhejta, sirf nested "user" object bhejta hai
    sellerName: row.seller_name || row.sellerName || row.user?.name || sellerFullName || row.username || "-",
    category: row.category || "",
    quantity: row.quantity || "",
    price: row.price || "",
    location: row.city || row.location || "",
    contact: row.conatct || row.contact || "",
    description: row.description || "",
    image: row.image || (Array.isArray(row.images) ? row.images[0] : "") || "",
    productImage: row.image || (Array.isArray(row.images) ? row.images[0] : "") || "",
    startDate: formatDisplayDate(row.start_date) || "",
    endDate: formatDisplayDate(row.end_date) || "",
    status: normalizeStatus(row.status),
    createdAt: formatDisplayDate(row.created_at) || "",
    updatedAt: formatDisplayDate(row.updated_at) || "",
  };
}

if (slug === "network") {
  const referralUser = row.user || {};
  const referrerUser = row.from_user || {};
  const fullName = (person = {}) =>
    [person.firstname, person.lastname].filter(Boolean).join(" ").trim();

  return {
    ...row,
    _rowKey: String(referralUser.id || row.user_id || row.id || `ref-${index}`),
    sr: row.sr || index + 1,
    userId: referralUser.id || row.user_id || row.userId || "",
    username: fullName(referralUser) || row.username || row.user_name || "-",
    email: referralUser.email || row.email || "",
    phone: referralUser.phone || row.phone || "",
    referralCode: row.referral_code || row.refral_code || row.referralCode || "-",
    referredBy: fullName(referrerUser) || row.referred_by_name || row.from_user_id || "-",
    totalReferrals: referralUser.total_referrals ?? row.total_referrals ?? 0,
    rankName: referralUser.rank_name || row.rank_name || row.rankName || "Starter",
    rewardAmount: referralUser.reward_amount || row.reward_amount || row.rewardAmount || 0,
    totalCommission: referralUser.total_commission || row.total_commission || row.totalCommission || 0,
    amount: row.amount || "",
    level: row.level || "",
    status: normalizeStatus(row.status ?? 1),
    createdDate: formatDisplayDate(row.created_at || row.createdAt) || "-",
  };
}

if (slug === "product-enquiry") {
  const customerName = [row.first_name, row.last_name].filter(Boolean).join(" ").trim();
  return {
    ...row,
    _rowKey: String(row.id || `enquiry-${index}`),
    sr: row.sr || index + 1,
    id: row.id || "",
    user_id: row.user_id || "",
    productName: row.type ? `${row.type === "ads" ? "Ad" : "Product"} #${row.ecom_id}` : `#${row.ecom_id || ""}`,
    customerName: customerName || "-",
    ownerName: row.owner_name || "-",
    mobileNumber: row.contact || row.mobile_number || "",
    email: row.email || "",
    productImage: row.product_image || row.image || "",
    message: row.message || "",
    dateTime: formatDisplayDate(row.created_at) || "",
    date: formatDisplayDate(row.created_at) || "",
    status: normalizeStatus(row.status),
  };
}

if (slug === "reports-product-enquiry") {
  return {
    ...row,
    _rowKey: String(row.id || `rep-pe-${index}`),
    sr: row.sr || index + 1,
    id: row.id || "",
    product: row.product || row.product_name || "",
    totalEnquiries: row.totalEnquiries || row.total_enquiries || "0",
    owner: row.owner || row.owner_name || "",
    date: formatDisplayDate(row.date || row.created_at) || "",
  };
}

if (slug === "reports-user-wise") {
  return {
    ...row,
    _rowKey: String(row.id || row.user_id || `rep-uw-${index}`),
    sr: row.sr || index + 1,
    user: row.user || row.user_name || row.username || "",
    productsAdded: row.productsAdded || row.products_added || "0",
    totalEnquiries: row.totalEnquiries || row.total_enquiries || "0",
  };
}

if (slug === "reports-subscription") {
  return {
    ...row,
    _rowKey: String(row.id || `rep-sub-${index}`),
    sr: row.sr || index + 1,
    user: row.user || row.user_name || row.username || "",
    plan: row.plan || row.plan_name || row.subscription_name || "",
    price: row.price || "",
    days: row.days || "",
  };
}


if (PURCHASER_SLUGS.includes(slug)) {
  const base = normalizeModuleRow("payment-history")({ ...row, module: row.module || row.subscription_type || row.type || PURCHASER_TYPE[slug] }, index);
  const fallbackId = row.id || row.payment_id || row.purchase_id || row.subscription_id || row.razorpay_payment_id || row.razorpay_order_id || `${slug}-${index}`;
  return { ...base, id: String(fallbackId), _rowKey: String(fallbackId) };
}

if (slug === "payment-history") {
  const typeRaw = String(row.module || row.subscription_type || row.type || "").toLowerCase();
  const statusRaw = String(row.status || row.payment_status || "created").toLowerCase();
  const statusLabel = statusRaw === "paid" ? "Paid" : statusRaw === "failed" ? "Failed" : "Created";
  const validityRaw = String(row.validity_status || "").toLowerCase();
  const seat = row.seat && typeof row.seat === "object" ? row.seat : null;
  return {
    ...row,
    _rowKey: String(row.payment_id || row.id || `payment-${index}`),
    sr: row.sr || index + 1,
    id: row.payment_id || row.id || "",
    username: row.user?.name || row.user_name || row.username || "-",
userEmail: row.user?.email || row.user_email || "-",
    userId: row.user_id ?? row.user?.id ?? "",
    planId: row.plan_id ?? row.plan?.id ?? "",
    type: typeRaw === "role" ? "Role" : typeRaw === "ads" ? "Ads" : typeRaw === "ecom" ? "Ecom" : typeRaw === "quiz" ? "Quiz" : typeRaw || "-",
    planTitle: row.plan?.title || row.plan_title || row.planTitle || row.title || "-",
    credits: row.plan?.credits ?? row.plan?.quiz_count ?? row.credits ?? "-",
    days: row.plan?.days ?? row.days ?? "-",
    amount: formatMoney(row.amount ?? row.price),
    status: statusLabel,          // 👈 FilterBar ka generic `status` filter isi field ko check karta hai
    validityStatus: validityRaw === "active" ? "Active" : validityRaw === "expired" ? "Expired" : "-",
    purchaseDate: formatDisplayDate(row.purchase_date || row.purchaseDate) || "-",
    startDate: formatDisplayDate(row.start_date || row.startDate) || "-",
    endDate: row.end_date || row.endDate ? formatDisplayDate(row.end_date || row.endDate) : "No expiry",
    razorpayOrderId: row.razorpay_order_id || row.razorpayOrderId || "-",
    razorpayPaymentId: row.razorpay_payment_id || row.razorpayPaymentId || "-",
    failureReason: row.failure_description || row.failure_reason || row.failureReason || "-",
    seatLocation: seat ? [seat.level, seat.village, seat.taluka, seat.district, seat.state].filter(Boolean).join(", ") || "-" : "-",
    createdAt: formatDisplayDate(row.created_at || row.createdAt) || "-",
  };
}

if (slug === "reports-ads-view") {
  return {
    ...row,
    _rowKey: String(row.id || `rep-adv-${index}`),
    sr: row.sr || index + 1,
    adTitle: row.adTitle || row.ad_title || "",
    totalViews: row.totalViews || row.total_views || "0",
    uniqueUsers: row.uniqueUsers || row.unique_users || "0",
  };
}
if (slug === "ads-management") {
  console.log("ADS_MANAGEMENT_RAW_ROW", row); // 👈 TEMP — console khol ke real field names check kar, baad me hata dena
  const fallbackUserName = [row.user?.firstname, row.user?.lastname].filter(Boolean).join(" ").trim();
  return {
    ...row,
    _rowKey: String(row.id || row.ads_id || `ads-detail-${index}`),
    sr: row.sr || index + 1,
    id: row.id || row.ads_id || "",
    adsId: row.ads_id || row.adsId || row.id || "",
    userId: row.user_id || row.userId || "",
    username: row.username || row.user_name || row.user?.name || fallbackUserName || row.user?.username || "",
    adsSubId: row.ads_sub_id || row.adsSubId || "",
    subscriptionName: row.subscription_name || row.subscriptionName || row.subscription?.title || row.ads_subscription?.title || row.plan?.title || "",
    adsTitle: row.title || row.ads_title || row.adsTitle || "",
    title: row.title || row.ads_title || row.adsTitle || "",
    status: normalizeStatus(row.status ?? row.is_active ?? row.active),
    views: row.views || row.view_count || "0",
    redirection: Number(row.redirection) === 1 ? "Yes" : "No",
    redirectionUrl: row.redirection_url || row.redirectionUrl || "",
    startDate: formatDisplayDate(row.start_date || row.startDate) || "",
    endDate: formatDisplayDate(row.end_date || row.endDate) || "",
    adsDescription: row.description || row.ads_description || row.adsDescription || "",
    description: row.description || row.ads_description || row.adsDescription || "",
      mediaFile: row.image || row.media_file || row.mediaFile || row.file || "",
    mediaFileUrl: row.image || row.image_url || row.media_url || row.mediaFileUrl || "",
    createdAt: formatDisplayDate(row.createdAt || row.created_at) || "",
    updatedAt: formatDisplayDate(row.updatedAt || row.updated_at) || "",
    isDeleted: Number(row.is_deleted) === 1,
  };
}

if (slug === "question-bank") {
  const options = Array.isArray(row.option) ? row.option : [];
  return {
    ...row,
    _rowKey: String(row.id || `question-${index}`),
    sr: row.sr || index + 1,
    id: row.id || "",
    quizTypeId: row.quiz_type_id ?? row.quizTypeId ?? "",
    groupKey: row.group_key || row.groupKey || "",
    question: row.question || "",
    optionA: options[0] ?? row.optionA ?? "",
    optionB: options[1] ?? row.optionB ?? "",
    optionC: options[2] ?? row.optionC ?? "",
    optionD: options[3] ?? row.optionD ?? "",
    correctAnswer: row.correct_ans ?? row.correctAnswer ?? "",
    explanation: row.explation ?? row.explanation ?? "",
    marks: row.marks || "",
    status: normalizeStatus(row.status ?? row.is_active ?? row.active),
    isDeleted: isDeletedRow(row),
    createdAt: formatDisplayDate(row.createdAt || row.created_at) || "",
    updatedAt: formatDisplayDate(row.updatedAt || row.updated_at) || "",
  };
}
  
if (slug === "quiz-subscription-create") {
  return {
    ...row,
    _rowKey: String(row.id || `quiz-plan-${index}`),
    sr: row.sr || index + 1,
    id: row.id || "",
    title: row.title || `Plan #${row.id || index + 1}`,
    description: row.description || "",
    quiz_count: row.quiz_count ?? row.quizCount ?? "",
    days: row.days ?? "",
    price: row.price ?? "",
    offerPrice: row.offer_price ?? row.offerPrice ?? "",
    offer_price: row.offer_price ?? row.offerPrice ?? "",
    status: normalizeStatus(row.status ?? row.is_active ?? row.active),
    isDeleted: Boolean(row.deleted_at) || Number(row.is_deleted) === 1,
    createdAt: formatDisplayDate(row.createdAt || row.created_at) || "",
    updatedAt: formatDisplayDate(row.updatedAt || row.updated_at) || "",
  };
}

if (slug === "quiz-subscription-by-user") {
  return {
    ...row,
    _rowKey: String(row.id || `quiz-sub-${index}`),
    sr: row.sr || index + 1,
    id: row.id || "",
    user_id: row.user_id || row.userId || "",
    username: row.user?.name || row.username || row.user_name || "-",
    planTitle: row.plan?.title || row.plan_title || row.planTitle || row.title || "-",
     plan: row.plan?.title || row.plan_title || "",  
    quiz_count: row.quiz_count ?? row.plan?.quiz_count ?? "",
    days: row.days ?? row.plan?.days ?? "",
     status: normalizeStatus(row.status ?? row.is_active),
    createdAt: formatDisplayDate(row.createdAt || row.created_at) || "",
  };
}

if (slug === "quiz-attempts") {
  // Admin API: GET /quiz-attempts -> { data: [ { attempt_id, user_name, quiz_title, ... } ], meta }
  const attemptId = row.attempt_id ?? row.id ?? "";
  const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
  const total = num(row.total_questions ?? row.totalQuestions);
  const correct = num(row.correct_answers ?? row.correctAnswers);
  const rawPct = row._pctRaw ?? row.percentage;
  const parsedPct = rawPct === null || rawPct === undefined || rawPct === "" ? NaN : Number(String(rawPct).replace("%", ""));
  const pct = Number.isFinite(parsedPct) ? parsedPct : (total ? Math.round((correct / total) * 100) : NaN);
  const completed = String(row.status_label ?? "").toLowerCase() === "completed"
    || Number(row.status) === 1
    || String(row.status ?? "").toLowerCase() === "completed";
  const secs = row.time_taken === null || row.time_taken === undefined || row.time_taken === "" ? NaN : Number(row.time_taken);
  const mmss = Number.isFinite(secs) ? `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(Math.floor(secs % 60)).padStart(2, "0")}` : "";
  const statusText = completed ? "Completed" : "In Progress";
  // NOTE: pass_status abhi hamesha null hai -> pass/fail column dikhaya hi nahi
  // NOTE: CellValue 0 ko "-" dikhata hai, isliye numbers String() me
  return {
    ...row,
    _rowKey: String(attemptId || `quiz-attempt-${index}`),
    _pctRaw: Number.isFinite(pct) ? pct : "",
    sr: row.sr || index + 1,
    id: attemptId === "" ? "" : String(attemptId),
    user_id: String(row.user_id ?? row.userId ?? row.user?.id ?? ""),
    username: row.user_name || row.user?.name || row.username || "-",
    userEmail: row.user_email || row.user?.email || row.userEmail || "-",
    userMobile: row.user_mobile || row.user?.mobile || row.userMobile || "-",
    quizTitle: row.quiz_title || row.quiz?.title || row.quizTitle || row.title || "-",
    quizType: row.quiz_type || row.quizType || "-",
    totalQuestions: String(total),
    attemptedQuestions: String(num(row.attempted_questions ?? row.attemptedQuestions)),
    correctAnswers: String(correct),
    wrongAnswers: String(num(row.wrong_answers ?? row.wrongAnswers)),
    skippedAnswers: String(num(row.skipped_answers ?? row.skippedAnswers)),
    marks: `${num(row.obtained_marks ?? row.obtainedMarks)} / ${num(row.total_marks ?? row.totalMarks)}`,
    percentage: Number.isFinite(pct) ? `${pct}%` : "-",
    timeTaken: row.time_taken_formatted || mmss || "-",
    status: statusText,          // client-side status filter ke liye
    attemptStatus: statusText,   // column/detail ke liye (status key StatusToggle dikhata hai, isliye alag)
    attemptedAt: formatIsoDate(row.attempt_date || row.attempted_at || row.created_at) || "",
    submittedAt: formatIsoDate(row.submitted_at) || "-",
    createdAt: formatIsoDate(row.attempt_date || row.created_at) || "",
  };
}

if (slug === "user-follows") {
  return {
    ...row,
    _rowKey: String(row.id || `user-follow-${index}`),
    sr: row.sr || index + 1,
    id: row.id || "",
      follower_id: row.follower_id || row.follower?.id || row.user_id || row.userId || "",
    follower_name: row.follower?.name || `${row.follower?.firstname || ""} ${row.follower?.lastname || ""}`.trim() || row.follower_name || row.user?.name || row.user_name || "-",
    follower_email: row.follower?.email || row.follower_email || row.user?.email || row.user_email || "-",
    following_id: row.following_id || row.following?.id || row.followed_user_id || row.target_user_id || "",
    following_name: row.following?.name || `${row.following?.firstname || ""} ${row.following?.lastname || ""}`.trim() || row.following_name || row.followed_user?.name || row.followed_user_name || "-",
    following_email: row.following?.email || row.following_email || row.followed_user?.email || "-",
    createdAt: formatDisplayDate(row.createdAt || row.created_at) || "",
  };
}

if (slug === "user-blocks") {
  return {
    ...row,
    _rowKey: String(row.id || `user-block-${index}`),
    sr: row.sr || index + 1,
    id: row.id || "",
       blocker_id: row.blocker_id || row.blocker?.id || row.user_id || row.userId || "",
    blocker_name: row.blocker?.name || `${row.blocker?.firstname || ""} ${row.blocker?.lastname || ""}`.trim() || row.blocker_name || row.user?.name || row.user_name || "-",
    blocker_email: row.blocker?.email || row.blocker_email || row.user?.email || row.user_email || "-",
    blocked_id: row.blocked_id || row.blocked?.id || row.blocked_user_id || row.target_user_id || "",
    blocked_name: row.blocked?.name || `${row.blocked?.firstname || ""} ${row.blocked?.lastname || ""}`.trim() || row.blocked_name || row.blocked_user?.name || row.blocked_user_name || "-",
    blocked_email: row.blocked?.email || row.blocked_email || row.blocked_user?.email || "-",
    reason: row.reason || row.block_reason || "",
    createdAt: formatDisplayDate(row.createdAt || row.created_at) || "",
  };
}


if (slug === "wallets") {
  console.log("RAW_WALLET_ROW", row); // TEMP — fields verify karke hata dena
  const u = row.user && typeof row.user === "object" ? row.user : {};
  const walletUserId = row.user_id ?? row.userId ?? u.id ?? "";
  const frozen = row.is_frozen === true || Number(row.is_frozen) === 1;
  return {
    ...row,
    _rowKey: String(walletUserId || `wallet-${index}`),
    sr: row.sr || index + 1,
    id: walletUserId,   // wallet detail API /wallets/{userId} hai, isliye id = userId
    userId: walletUserId,
    userName: u.name || [u.firstname, u.lastname].filter(Boolean).join(" ").trim() || row.user_name || row.userName || (typeof row.user === "string" ? row.user : "") || row.name || "-",
    user: u.name || row.userName || (typeof row.user === "string" ? row.user : "") || "",
    userEmail: u.email || row.email || "",
    pendingCommission: formatMoney(row.pending_commission ?? row.pending_balance),
    approvedCommission: formatMoney(row.approved_commission ?? row.approved_balance),
    reversedCommission: formatMoney(row.reversed_commission),
    withdrawableBalance: formatMoney(row.withdrawable_balance),
    lockedBalance: formatMoney(row.locked_balance),
    withdrawnBalance: formatMoney(row.withdrawn_balance),
    totalEarned: formatMoney(row.total_earned),
    status: frozen ? "Frozen" : "Active",
    frozenReason: row.frozen_reason || row.freeze_reason || "",
    createdAt: formatDisplayDate(row.created_at || row.createdAt) || "",
  };
}

if (slug === "withdrawal") {
  console.log("RAW_WITHDRAWAL_ROW", row); // TEMP
  const u = row.user && typeof row.user === "object" ? row.user : {};
  const rawStatus = String(row.status ?? "").trim().toLowerCase();
  return {
    ...row,
    _rowKey: String(row.id || `withdrawal-${index}`),
    sr: row.sr || index + 1,
    id: row.id || "",
    userId: row.user_id ?? row.userId ?? u.id ?? "",
    userName: u.name || [u.firstname, u.lastname].filter(Boolean).join(" ").trim() || row.user_name || row.userName || (typeof row.user === "string" ? row.user : "") || "-",
    user: u.name || row.userName || (typeof row.user === "string" ? row.user : "") || "",
    withdrawalNumber: row.withdrawal_no || row.withdrawal_number || row.reference_no || row.reference || row.id || "",
    amount: formatMoney(row.amount),
    method: String(row.method || "").toUpperCase(),
    accountHolder: row.account_holder_name || row.account_holder || row.holder_name || "",
    accountNumber: row.account_number || row.account_number_masked || "",   // list me masked, detail me full
    ifsc: row.ifsc || row.ifsc_code || "",
    upiId: row.upi_id || "",
    payoutReference: row.payout_reference || "",
    payoutMode: row.payout_mode || "",
    adminRemarks: row.admin_remarks || "",
    rejectReason: row.reject_reason || row.rejection_reason || row.reason || "",
    status: rawStatus ? rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1) : "Pending",
    createdAt: formatDisplayDate(row.created_at || row.createdAt) || "",
    approvedAt: formatDisplayDate(row.approved_at) || "",
    paidAt: formatDisplayDate(row.paid_at) || "",
  };
}

if (slug === "profile-update-requests") {
  return summarizeProfileUpdateRequest(row, index);
}

  return {
    ...row,
    _rowKey: String(id || rowKey(row) || `${slug}-${index}`),
    sr: row.sr || index + 1,
    id,
    userId,
    productId,
    sellerName,
    title: row.title || sellerName || row.name || row.quiz_title || row.quizTitle || "New Record",
    author: row.author || row.created_by || row.createdBy || "",
    category: row.category || row.news_category || row.newsCategory || "",
    sub_id: row.sub_id || row.subId || "",
    subject: row.subject || row.quiz_subject || row.quizSubject || "",
    difficulty: row.difficulty || row.level || "",
     testType: testTypeLabelById[Number(row.test_type)] || row.testType || row.test_type || row.quiz_type || row.type || "",
    timeLimit: row.time_in_min ?? row.timeLimit ?? "",
    groupKey: row.group_key || row.groupKey || "",
    status: normalizeStatus(row.status ?? row.is_active ?? row.active),
    mediaFile: row.mediaFile || row.media_file || row.media || row.file || "",
    mediaFileUrl: image,
    image: image || undefined,
    productImage: image || row.productImage || row.product_image || "",
    description: row.description || row.content || row.body || "",
    location: row.location || row.city || "",
    contact: row.contact || row.mobileNumber || row.mobile || row.phone || "",
    credit: row.credit || row.credits || "",
    credits: row.credits || row.credit || row.total_credit || row.total_credits || "",
    total_credit: row.total_credit || row.total_credits || row.credits || "",
    total_credits: row.total_credits || row.total_credit || row.credits || "",
    used_credit: row.used_credit || row.usedCredit || "",
    quantity: row.quantity || row.qty || "",
    price: row.price || row.cost || "",
    offerPrice: row.offerPrice || row.offer_price || "",
    offer_price: row.offer_price || row.offerPrice || "",
    days: row.days || "",
    // timeLimit: row.time_in_min ?? row.timeLimit ?? "",
    // groupKey: row.group_key || row.groupKey || "",
    is_deleted: row.is_deleted ?? row.isDeleted ?? "",
    createdAt: formatDisplayDate(row.createdAt || row.created_at) || "",
    updatedAt: formatDisplayDate(row.updatedAt || row.updated_at) || "",
    questions,
    question: questions[0]?.question || row.question || "",
    optionA: questions[0]?.optionA || row.optionA || row.option_a || "",
    optionB: questions[0]?.optionB || row.optionB || row.option_b || "",
    optionC: questions[0]?.optionC || row.optionC || row.option_c || "",
    optionD: questions[0]?.optionD || row.optionD || row.option_d || "",
    correctAnswer: questions[0]?.correctAnswer || row.correctAnswer || row.correct_answer || "",
    explanation: questions[0]?.explanation || row.explanation || "",
    marks: row.marks || questions.reduce((total, item) => total + Number(item.marks || 0), 0) || "",
  };
};
const dashboardStatsFromPayload = (payload) => {
  const stats = payload?.stats || payload?.data?.stats || payload?.counts || payload?.data?.counts || payload?.data || {};
  const get = (...paths) => paths.map((path) => readPath(stats, path)).find((value) => value !== undefined && value !== null);
  return {
    all: get("total_users", "totalUsers", "users", "total") ?? null,
    premium: get("premium_users", "premiumUsers", "premium") ?? null,
    active: get("active_users", "activeUsers", "active") ?? null,
    inactive: get("inactive_users", "inactiveUsers", "inactive") ?? null,
  };
};

const userPayloadFromRecord = (record = {}) => {
  const payload = new FormData();
  const firstName = record.firstname || record.name || record.username || "";
  const lastName = record.lastname || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  payload.append("firstname", firstName);
  payload.append("lastname", lastName);
  payload.append("name", fullName || firstName);
  payload.append("email", record.email || "");
  payload.append("mobile_number", record.mobileNumber || record.phone || "");
  payload.append("phone", record.phone || record.mobileNumber || "");
  payload.append("state", record.state || "");
  payload.append("district", record.district || "");
payload.append("taluka", record.taluka || "");
  payload.append("village", record.village || "");
  if (record.profile_image) payload.append("profile_image", record.profile_image);
  if (record.password) payload.append("password", record.password);
  payload.append("status", normalizeStatusValue(record.status));
  payload.append("bio", record.bio || record.description || "");
  console.log("USER_FORM_DATA", Object.fromEntries(payload.entries()));
  return payload;
};

const loadUsersFromApi = async (slug) => {
  if (slug === "dashboard") {
    const dashboardResponse = await apiClient.get(API.DASHBOARD, { headers: apiHeaders(), timeout: 12000 });
    let rows = extractRows(dashboardResponse.data).map(normalizeUserRow);
    if (!rows.length) {
      const usersResponse = await apiClient.get(API.USERS, { headers: apiHeaders(), timeout: 12000 });
      rows = extractRows(usersResponse.data).map(normalizeUserRow);
    }
    return { rows, stats: dashboardStatsFromPayload(dashboardResponse.data) };
  }
  const response = await apiClient.get(API.USERS, { headers: apiHeaders(), timeout: 12000 });
  return { rows: extractRows(response.data).map(normalizeUserRow), stats: null };
};

const saveUserToApi = async (record, mode, currentRow = {}) => {
  const payload = userPayloadFromRecord(record);
  const config = { headers: apiHeaders(), timeout: 12000 };
  try {
    const requestPayload = spoofedFormData(mode === "Add" ? "POST" : "PUT", payload);
    const response = mode === "Add"
      ? await apiClient.post(API.USERS_ADD, requestPayload, config)
      : await apiClient.post(endpoint(API.USERS_UPDATE, currentRow), requestPayload, config);
    const apiRow = response.data?.user || response.data?.data?.user || response.data?.data || response.data;
   const mergedRow = { ...record };
if (apiRow && typeof apiRow === "object") {
  Object.entries(apiRow).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") mergedRow[key] = value;
  });
}
["state", "district", "taluka", "village"].forEach((key) => {
  if (!mergedRow[key] && record[key]) mergedRow[key] = record[key]; // 👈 add this block
});
return normalizeUserRow(mergedRow);
  } catch (error) {
    if (!isMissingApiRoute(error)) throw error;
    return normalizeUserRow({ ...currentRow, ...record });
  }
};

const deleteUserFromApi = (row) => {
  const deleteIdentifier = resolveRecordIdentifier(row);
  const payload = spoofedFormData("DELETE");
  console.log("DELETE_REQUEST", {
    resource: "users",
    identifier: deleteIdentifier,
    endpoint: endpoint(API.USERS_DELETE, row),
    method: "POST",
    payload: Object.fromEntries(payload.entries()),
  });
  return apiClient.post(endpoint(API.USERS_DELETE, row), payload, { headers: apiHeaders(), timeout: 12000 });
};

const updateUserStatusInApi = async (row, status) => {
  const payload = new FormData();
  payload.append("status", normalizeStatusValue(status));
  payload.append("_method", "PUT");
  console.log("STATUS_UPDATE_REQUEST", {
    resource: "users",
    identifier: String(row?.id || row?.userId || row?.profileId || rowKey(row) || ""),
    endpoint: endpoint(API.USERS_STATUS, row),
    method: "POST",
    payload: Object.fromEntries(payload.entries()),
  });
  return apiClient.post(endpoint(API.USERS_STATUS, row), payload, { headers: apiHeaders(), timeout: 12000 });
};


const questionAnsPayload = (rows = [], { quizTypeId, groupKey } = {}) => ({
  quiz_type_id: quizTypeId,
  group_key: groupKey,
  questions: rows.map((row) => ({
    ...(row.id ? { id: row.id } : {}),
    question: row.question,
    option: [row.optionA, row.optionB, row.optionC, row.optionD],
    correct_ans: row.correctAnswer,
    explation: row.explanation,
    marks: row.marks,
  })),
});

const modulePayloadFromForm = (slug, record = {}, form) => {
  const formData = form ? new FormData(form) : new FormData();
  const payload = new FormData();
  const append = (key, value) => {
    if (value !== undefined && value !== null && value !== "") payload.append(key, value);
  };
if (slug === "news") {
append("tittle", record.title);
  append("report_type", record.category);
  append("status", normalizeStatusValue(record.status));
  append("description", record.description);
  append("created_at", toDateInputValue(record.createdAt));
  const mediaFile = formData.get("media-file");
  if (mediaFile instanceof File && mediaFile.size) append("media_file", mediaFile);
  console.log("MODULE_FORM_DATA", Object.fromEntries(payload.entries()));
  return payload;
}

if (slug === "subscription-plan") {
  append("title", record.title);
  append("description", record.description);
  append("credits", record.credits);
  append("days", parseInt(record.days, 10) || 0);
  append("price", record.price);
  append("offer_price", record.offerPrice || record.offer_price);
  append("status", normalizeStatusValue(record.status));

   append("role_id", resolveRoleIdFromLocalizedLabel(record) || "");

  append("state", record.state);
  append("district", record.district);
   append("taluka", record.taluka);
  append("village", record.village);
  return payload;
}
if (slug === "ads-management") {
  append("title", record.title);
  append("description", record.description);
  append("ads_sub_id", record.adsSubId || record.ads_sub_id);       // ⬅️ missing tha
  append("redirection", record.redirection ? 1 : 0);                // ⬅️ missing tha
  append("redirection_url", record.redirectionUrl || record.redirection_url); // ⬅️ missing tha
  append("start_date", record.startDate ? toDateInputValue(record.startDate) : "");
  append("end_date", record.endDate ? toDateInputValue(record.endDate) : "");
  append("status", normalizeStatusValue(record.status));
  const mediaFile = formData.get("media-file");
  if (mediaFile instanceof File && mediaFile.size) append("image", mediaFile); // ⬅️ key "media_file" nahi, "image" honi chahiye (response me "image" key hai)
  console.log("MODULE_FORM_DATA", Object.fromEntries(payload.entries()));
  return payload;
}

if (slug === "ecom-sell") {
  append("ecom_sub_id", record.ecomSubId);
  append("category", record.category);
  append("product_name", record.title);
  append("quantity", record.quantity);
  append("price", record.price);
  append("city", record.location);       // "city" field data.city → record.location me already map hota hai
  append("conatct", record.contact);     // ⚠️ backend ka typo "conatct" waisa hi rakha
  append("start_date", record.startDate ? toDateInputValue(record.startDate) : "");
  append("end_date", record.endDate ? toDateInputValue(record.endDate) : "");
  append("description", record.description);
  append("status", normalizeStatusValue(record.status));
  const imageFile = formData.get("images");
  if (imageFile instanceof File && imageFile.size) append("images[]", imageFile);
  console.log("MODULE_FORM_DATA", Object.fromEntries(payload.entries()));
  return payload;
}


  if (isSubscriptionApiSlug(slug)) {
    append("sub_id", record.sub_id);
    append("title", record.title);
    append("description", record.description);
    append("credits", record.credits);
    append("days", record.days);
    append("price", record.price);
    append("offer_price", record.offerPrice || record.offer_price);
    append("status", normalizeStatusValue(record.status));
    console.log("MODULE_FORM_DATA", Object.fromEntries(payload.entries()));
    return payload;
  }

  append("title", record.title);
append("subject", record.subject);
append("difficulty", record.difficulty);
append("test_type", testTypeIdMap[record.testType] || record.testType);
append("time_in_min", record.timeLimit);
append("group_key", record.groupKey || generateGroupKey());
append("marks", record.marks);
append("status", normalizeStatusValue(record.status));
(record.questions || []).forEach((question, index) => {
  append(`questions[${index}][question]`, question.question);
  append(`questions[${index}][marks]`, question.marks);
  append(`questions[${index}][option_a]`, question.optionA);
  append(`questions[${index}][option_b]`, question.optionB);
  append(`questions[${index}][option_c]`, question.optionC);
  append(`questions[${index}][option_d]`, question.optionD);
  append(`questions[${index}][correct_answer]`, question.correctAnswer);
  append(`questions[${index}][explanation]`, question.explanation);
});
  console.log("MODULE_FORM_DATA", Object.fromEntries(payload.entries()));
  return payload;
};

const extractSavedRow = (payload, slug) => {
  const singular = moduleApi[slug]?.singular || (slug === "news" ? "news" : "quiz");
  return payload?.[singular] || payload?.data?.[singular] || payload?.data?.record || payload?.record || payload?.data || payload;
};

// Wallet and withdrawal endpoints require user_id; rows for all users are merged client-side.
const WALLET_KEYS = ["withdrawable_balance", "approved_commission", "approved_balance", "pending_commission", "pending_balance", "withdrawn_balance", "locked_balance"];
const isWalletObject = (obj) => obj && typeof obj === "object" && !Array.isArray(obj) && WALLET_KEYS.some((key) => key in obj);
const pickWalletObject = (data) =>
  [data?.wallet, data?.data?.wallet, data?.summary, data?.data?.summary, data?.data, data].find(isWalletObject) || null;
const toList = (value) => (Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : []);

const userIdRequiredSlugs = new Set(["wallets", "withdrawal"]);
const isUserIdRequiredError = (error) =>
  error?.response?.status === 422 && Boolean(error.response?.data?.errors?.user_id);

const loadWalletOrWithdrawalIndex = async (slug, extraParams = {}) => {
  const client = moduleClientForSlug(slug);

  // For APIs which allow an unscoped index call, use it directly.
  if (!userIdRequiredSlugs.has(slug)) {
    try {
      const res = await client.get(moduleApi[slug].index, { headers: apiHeaders(), params: extraParams, timeout: 12000 });
      console.log(`RAW_${slug.toUpperCase()}_LIST_RESPONSE`, res.data); // TEMP
      return extractRows(res.data).map(normalizeModuleRow(slug));
    } catch (error) {
      if (!isUserIdRequiredError(error)) throw error;   // koi aur error ho to toast me dikhao
      userIdRequiredSlugs.add(slug);                    // backend ko user_id chahiye -> STEP 2
    }
  }

  // Backend requires user_id, so request each user's records and merge them for the table.
  const { rows: allUsers } = await loadUsersFromApi("user-profile");
  const users = allUsers.filter((u) => u.id).slice(0, 200);
  if (!users.length) throw new Error("Users list khali hai, isliye wallet/withdrawal load nahi ho sakta (backend ko user_id chahiye).");
  const settledAll = [];
  for (let i = 0; i < users.length; i += 10) {           // 10-10 ke batch, server par load na pade
    const batch = users.slice(i, i + 10);
    const settled = await Promise.allSettled(
      batch.map(async (u, batchIndex) => {
        const res = await client.get(moduleApi[slug].index, {
          headers: apiHeaders(),
          params: { ...extraParams, user_id: u.id },
          timeout: 12000,
        });
        if (i === 0 && batchIndex === 0) console.log(`RAW_${slug.toUpperCase()}_RESPONSE user_id=${u.id}`, res.data); // TEMP
        const userInfo = { id: u.id, name: u.name, email: u.email };
        if (slug === "wallets") {
          const wallet = pickWalletObject(res.data);
          return wallet ? [{ ...wallet, user_id: u.id, user: wallet.user || userInfo }] : [];
        }
        return extractRows(res.data).map((row) => ({ user_id: u.id, user: row.user || userInfo, ...row }));
      })
    );
    settledAll.push(...settled);
  }
  const failed = settledAll.filter((r) => r.status === "rejected");
  if (failed.length && failed.length === settledAll.length) throw failed[0].reason;
  return settledAll
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .map(normalizeModuleRow(slug));
};
// Payment history + purchasers: all-users list, optional user_id filter, optional plan-wise endpoint
const loadPaymentModule = async (slug, { userId = "", planId = "" } = {}) => {
  const cfg = moduleApi[slug];
  const params = { per_page: 100 };
  if (userId) params.user_id = userId;
  const url = planId && cfg.planIndex ? endpoint(cfg.planIndex, planId) : cfg.index;
  const res = await moduleClientForSlug(slug).get(url, { headers: apiHeaders(), params, timeout: 12000 });
  console.log(`RAW_${slug.toUpperCase()}_RESPONSE`, url, params, res.data); // TEMP — shape check ke baad hata dena
  return extractRows(res.data).map(normalizeModuleRow(slug));
};

// Quiz attempts (admin): GET /quiz-attempts?per_page=100&page=N&user_id=
// Backend paginated hai (max 100/page), isliye saare pages merge karte hain taaki table me sab dikhe.
const loadQuizAttemptsModule = async ({ userId = "", ...rest } = {}) => {
  const params = { per_page: 100, ...rest };
  if (userId) params.user_id = userId;
  const all = [];
  let page = 1;
  let lastPage = 1;
  do {
    const res = await apiClient.get(moduleApi["quiz-attempts"].index, {
      headers: apiHeaders(),
      params: { ...params, page },
      timeout: 20000,
    });
    if (page === 1) console.log("RAW_QUIZ_ATTEMPTS_RESPONSE", params, res.data); // TEMP — shape check ke baad hata dena
    all.push(...extractRows(res.data));
    lastPage = Number(res.data?.meta?.last_page ?? 1) || 1;
    page += 1;
  } while (page <= lastPage && page <= 50);
  return all.map(normalizeModuleRow("quiz-attempts"));
};

const loadModuleFromApi = async (slug, extraParams = {}) => {

  if (!moduleApi[slug]) {
    console.warn(`No API configuration found for slug: ${slug}`);
    return [];
  }
  if (slug === "news") {
    const response = await axiosClient.get(API.NEWS_INDEX, { headers: apiHeaders(), timeout: 12000 });
    return extractRows(response.data).map(normalizeModuleRow("news"));
  }
  if (slug === "quiz-attempts") {
    return loadQuizAttemptsModule(extraParams);
  }
  if (["wallets", "withdrawal"].includes(slug)) {
    return loadWalletOrWithdrawalIndex(slug, extraParams);
  }
  const response = await moduleClientForSlug(slug).get(moduleApi[slug].index, { headers: apiHeaders(), params: extraParams, timeout: 12000 });
  return extractRows(response.data).map(normalizeModuleRow(slug));
};

const showModuleFromApi = async (slug, row) => {
   if (!moduleApi[slug]) {
    console.warn(`No API configuration found for slug: ${slug}`);
    return normalizeModuleRow(slug)(row);
  }
  
   if (!moduleApi[slug]?.show && slug !== "news") {          // 👈 ADD KARO
    console.warn(`No 'show' endpoint configured for slug: ${slug}, using cached row`);
    return normalizeModuleRow(slug)(row);
  }
  const detailIdentifier = resolveRecordIdentifier(row);
  if (slug === "news") {
    const response = await axiosClient.get(API.NEWS_SHOW(detailIdentifier), { headers: apiHeaders(), timeout: 12000 });
    return normalizeModuleRow("news")(extractSavedRow(response.data, "news"));
  }
  const response = await moduleClientForSlug(slug).get(endpoint(moduleApi[slug]?.show, detailIdentifier), { headers: apiHeaders(), timeout: 12000 });
  return normalizeModuleRow(slug)(extractSavedRow(response.data, slug));
};

const saveModuleToApi = async (slug, record, mode, currentRow = {}, form) => {
  const endpoints = moduleApi[slug];
   if (!endpoints) {
    console.warn(`No API configuration found for slug: ${slug}, saving locally only`);
    return normalizeModuleRow(slug)({ ...record, _local: true });
  }
  if (!endpoints) return record;
  const payload = modulePayloadFromForm(slug, record, form);
  const requestPayload = new FormData();
  payload.forEach((value, key) => requestPayload.append(key, value));
  if (mode !== "Add") requestPayload.append("_method", "PUT");
  const client = moduleClientForSlug(slug);
 const requestConfig = (slug === "news" || slug === "ads-management")
  ? { headers: buildMultipartHeaders(), timeout: 12000 }
  : { headers: apiHeaders(), timeout: 12000 };
  try {
    console.log("MODULE_SUBMISSION_PAYLOAD", {
      slug,
      mode,
      endpoint: mode === "Add" ? endpoints.add : endpoint(endpoints.update, currentRow),
      headers: requestConfig.headers,
      payload: Object.fromEntries(requestPayload.entries()),
    });
    const response = mode === "Add"
      ? await client.post(endpoints.add, requestPayload, requestConfig)
      : await client.post(endpoint(endpoints.update, currentRow), requestPayload, requestConfig);
    const apiRow = extractSavedRow(response.data, slug);


     const fetchedId = resolveRecordIdentifier(apiRow);
    if (!fetchedId) {
      console.warn("Backend response missing valid id for", slug, "- using local record as-is");
      return normalizeModuleRow(slug)(record);
    }

    
    const mergedRow = { ...record };
    if (apiRow && typeof apiRow === "object") {
      Object.entries(apiRow).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") mergedRow[key] = value;
      });
    }
    return normalizeModuleRow(slug)(mergedRow);
  } catch (error) {
    console.error("MODULE_SUBMISSION_ERROR", {
      slug,
      mode,
      endpoint: mode === "Add" ? endpoints.add : endpoint(endpoints.update, currentRow),
      message: apiMessage(error, "Module submission failed"),
      payload: Object.fromEntries(requestPayload.entries()),
    });
    if (!isMissingApiRoute(error)) throw error;
    return normalizeModuleRow(slug)({ ...record, _local: true, createdAt: record.createdAt || formatDisplayDate(new Date()) });
  }
};

// Ye endpoints /api/rti-admin/* par real HTTP DELETE maangte hain (admin token; user token par 403 admin_required)
const REAL_DELETE_RTI_ADMIN_SLUGS = ["quiz-attempts", "withdrawal"];

const deleteModuleFromApi = (slug, row) => {
  const deleteIdentifier = resolveRecordIdentifier(row);
  const client = moduleClientForSlug(slug);

  if (REAL_DELETE_RTI_ADMIN_SLUGS.includes(slug)) {
    // NOTE: withdrawal ka list/approve/reject adminRtiClient (/admin-rti) par hai, lekin delete /rti-admin par -> apiClient
    const url = endpoint(moduleApi[slug]?.delete, row);
    console.log("DELETE_REQUEST", { resource: slug, identifier: deleteIdentifier, endpoint: url, method: "DELETE" });
    return apiClient.delete(url, { headers: apiHeaders(), timeout: 12000 });
  }

  // Admin RTI (user-follows / user-blocks) real DELETE method use karta hai —
  // baaki modules Laravel-style spoofed POST (_method=DELETE) use karte hain.
  if (isAdminRtiApiSlug(slug)) {
    console.log("DELETE_REQUEST", {
      resource: slug,
      identifier: deleteIdentifier,
      endpoint: endpoint(moduleApi[slug]?.delete, row),
      method: "DELETE",
    });
    return client.delete(endpoint(moduleApi[slug]?.delete, row), { headers: apiHeaders(), timeout: 12000 });
  }

  const payload = spoofedFormData("DELETE");
  if (isSubscriptionApiSlug(slug)) payload.append("is_deleted", "0");
  const requestConfig = slug === "news"
    ? { headers: buildMultipartHeaders(), timeout: 12000 }
    : { headers: apiHeaders(), timeout: 12000 };
  console.log("DELETE_REQUEST", {
    resource: slug,
    identifier: deleteIdentifier,
    endpoint: endpoint(moduleApi[slug]?.delete, row),
    method: "POST",
    payload: Object.fromEntries(payload.entries()),
  });
  return client.post(endpoint(moduleApi[slug]?.delete, row), payload, requestConfig);
};

const STATUS_ONE_TWO_SLUGS = ["ecommerce-subscription", "payment-history", "ecom-sell"];
const usesOneTwoStatus = (slug) => STATUS_ONE_TWO_SLUGS.includes(slug);

const updateModuleStatusInApi = async (slug, row, status) => {
  const endpoints = moduleApi[slug];
  const payload = new FormData();
  payload.append("status", usesOneTwoStatus(slug) ? (isPositiveStatus(status) ? 1 : 2) : normalizeStatusValue(status));
  payload.append("_method", "PATCH");
  const client = moduleClientForSlug(slug);
  const requestConfig = slug === "news"
    ? { headers: buildMultipartHeaders(), timeout: 12000 }
    : { headers: apiHeaders(), timeout: 12000 };
  console.log("STATUS_UPDATE_REQUEST", {
    resource: slug,
    identifier: resolveRecordIdentifier(row),
    endpoint: endpoints?.status ? endpoint(endpoints.status, row) : endpoint(endpoints.update, row),
    method: "POST",
    payload: Object.fromEntries(payload.entries()),
  });
  if (endpoints?.status) {
    return client.post(endpoint(endpoints.status, row), payload, requestConfig);
  }
  return client.post(endpoint(endpoints.update, row), payload, requestConfig);
};

const restoreQuizFromApi = (row) =>
  apiClient.post(endpoint(API.QUIZ_RESTORE, row), {}, { headers: apiHeaders(), timeout: 12000 });

const approveProfileRequestInApi = (row) =>
  adminRtiClient.post(endpoint(API.PROFILE_UPDATE_REQUESTS_APPROVE, row), {}, { headers: apiHeaders(), timeout: 12000 });

const approveWithdrawalInApi = (row, admin_remarks) =>
  adminRtiClient.patch(endpoint(API.WITHDRAWAL_APPROVE, row), admin_remarks ? { admin_remarks } : {}, { headers: apiHeaders(), timeout: 12000 });

const rejectWithdrawalInApi = (row, reason) =>
  adminRtiClient.patch(endpoint(API.WITHDRAWAL_REJECT, row), { reason }, { headers: apiHeaders(), timeout: 12000 });

const rejectProfileRequestInApi = (row, reason) =>
  adminRtiClient.post(endpoint(API.PROFILE_UPDATE_REQUESTS_REJECT, row), { reason }, { headers: apiHeaders(), timeout: 12000 });
const buildQuestionAnswerJsonPayload = (record = {}) => {
  const rawQuestions = record.questions?.length ? record.questions : [{
    id: record.id,
    question: record.question,
    marks: record.marks,
    optionA: record.optionA,
    optionB: record.optionB,
    optionC: record.optionC,
    optionD: record.optionD,
    correctAnswer: record.correctAnswer,
    explanation: record.explanation,
  }];
  return {
    quiz_type_id: record.quizTypeId,
    group_key: record.groupKey || generateGroupKey(),
    questions: rawQuestions
      .filter((q) => q.question)
      .map((q) => ({
        ...(q.id ? { id: q.id } : {}),
        question: q.question,
        option: [q.optionA || "", q.optionB || "", q.optionC || "", q.optionD || ""],
        correct_ans: q.correctAnswer,
        explation: q.explanation,
        marks: q.marks,
      })),
  };
};

const saveQuestionBankToApi = async (record, mode, currentRow = {}) => {
  const payload = buildQuestionAnswerJsonPayload(record);
  const quizTypeId = payload.quiz_type_id || currentRow.quizTypeId;

  // 👇 JSON ki jagah ab FormData banayenge — baaki modules jaisa
  const formPayload = new FormData();
  formPayload.append("quiz_type_id", payload.quiz_type_id || "");
  formPayload.append("group_key", payload.group_key || "");

  payload.questions.forEach((question, index) => {
    if (question.id) formPayload.append(`questions[${index}][id]`, question.id);
    formPayload.append(`questions[${index}][question]`, question.question || "");
    formPayload.append(`questions[${index}][option][0]`, question.option?.[0] || "");
    formPayload.append(`questions[${index}][option][1]`, question.option?.[1] || "");
    formPayload.append(`questions[${index}][option][2]`, question.option?.[2] || "");
    formPayload.append(`questions[${index}][option][3]`, question.option?.[3] || "");
    formPayload.append(`questions[${index}][correct_ans]`, question.correct_ans || "");
    formPayload.append(`questions[${index}][explation]`, question.explation || "");
    formPayload.append(`questions[${index}][marks]`, question.marks || "");
  });

  const config = { headers: apiHeaders(), timeout: 12000 };   // 👈 Content-Type header nahi, multipart apne aap set hoga

  const requestPayload = spoofedFormData(mode === "Add" ? "POST" : "PUT", formPayload);
  // 👆 yahi baaki modules wala helper hai — real method hamesha POST, _method field ke through override

  const response = mode === "Add"
    ? await apiClient.post(API.QUESTION_ANS_ADD, requestPayload, config)
    : await apiClient.post(endpoint(API.QUESTION_ANS_UPDATE, quizTypeId), requestPayload, config);

  const savedRow = extractRows(response.data)[0] || response.data?.data || response.data || {};
  return normalizeModuleRow("question-bank")({
    ...record,
    ...savedRow,
    quizTypeId: payload.quiz_type_id,
    groupKey: payload.group_key,
  });
};


const findIdDeep = (obj, depth = 0) => {
  if (!obj || typeof obj !== "object" || depth > 3) return "";
  if (obj.id !== undefined && obj.id !== null && obj.id !== "") return String(obj.id);
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value && typeof value === "object") {
      const found = findIdDeep(value, depth + 1);
      if (found) return found;
    }
  }
  return "";
};


const quizSubscriptionPlanPayload = (record = {}) => ({
  title: record.title || "",
  description: record.description || "",
  quiz_count: Number(record.quiz_count || 0),
  days: Number(record.days || 0),
  price: Number(record.price || 0),
  offer_price: Number(record.offerPrice || record.offer_price || 0),
  status: normalizeStatusValue(record.status),
});

const saveQuizSubscriptionPlanToApi = async (record, mode, currentRow = {}) => {
  const payload = quizSubscriptionPlanPayload(record);
  const config = { headers: apiHeaders(), timeout: 12000 };   // 👈 JSON Content-Type hataya

  const requestPayload = spoofedFormData(mode === "Add" ? "POST" : "PUT", payload);
  const response = mode === "Add"
    ? await apiClient.post(API.QUIZ_SUBSCRIPTION_PLAN_ADD, requestPayload, config)
    : await apiClient.post(endpoint(API.QUIZ_SUBSCRIPTION_PLAN_UPDATE, currentRow), requestPayload, config);

  const apiRow = extractSavedRow(response.data, "quiz-subscription-create");
  const mergedRow = { ...record };
  if (apiRow && typeof apiRow === "object") {
    Object.entries(apiRow).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") mergedRow[key] = value;
    });
  }
  return normalizeModuleRow("quiz-subscription-create")(mergedRow);
};

const deleteQuizSubscriptionPlanFromApi = (row) => {
  const payload = spoofedFormData("DELETE");
  return apiClient.post(endpoint(API.QUIZ_SUBSCRIPTION_PLAN_DELETE, row), payload, { headers: apiHeaders(), timeout: 12000 });
};

const updateQuizSubscriptionPlanStatusInApi = (row, status) => {
  const payload = spoofedFormData("PATCH", { status: normalizeStatusValue(status) });
  return apiClient.post(endpoint(API.QUIZ_SUBSCRIPTION_PLAN_STATUS, row), payload, { headers: apiHeaders(), timeout: 12000 });
};

const restoreQuizSubscriptionPlanFromApi = (row) => {
  const payload = spoofedFormData("PATCH");
  return apiClient.post(endpoint(API.QUIZ_SUBSCRIPTION_PLAN_RESTORE, row), payload, { headers: apiHeaders(), timeout: 12000 });
};
const saveQuizToApi = async (record, mode, currentRow = {}) => {
  const groupKey = record.groupKey || currentRow.groupKey || generateGroupKey();

  const headerPayload = new FormData();
  const append = (key, value) => {
    if (value !== undefined && value !== null && value !== "") headerPayload.append(key, value);
  };
  append("title", record.title);
  append("subject", record.subject);
  append("difficulty", record.difficulty);
  append("test_type", testTypeIdMap[record.testType] || record.testType);
  append("time_in_min", record.timeLimit);
  append("marks", record.marks);
  append("status", normalizeStatusValue(record.status));
  append("group_key", groupKey);

  const config = { headers: apiHeaders(), timeout: 12000 };
  const requestPayload = spoofedFormData(mode === "Add" ? "POST" : "PUT", headerPayload);
  const response = mode === "Add"
    ? await apiClient.post(API.QUIZ_ADD, requestPayload, config)
    : await apiClient.post(endpoint(API.QUIZ_UPDATE, currentRow), requestPayload, config);

  const quizTypeId = findIdDeep(response.data) || currentRow.id;

 const cleanedQuestions = (record.questions || []).filter((q) => q.question);
let savedQuestions = [];

if (cleanedQuestions.length && quizTypeId) {
  const formConfig = { headers: apiHeaders(), timeout: 12000 };

  if (mode === "Add") {
    // 👇 Add mode: sab naye hain, sab ek saath POST
    const questionFormPayload = new FormData();
    questionFormPayload.append("quiz_type_id", quizTypeId);
    questionFormPayload.append("group_key", groupKey);
    cleanedQuestions.forEach((q, index) => {
      questionFormPayload.append(`questions[${index}][question]`, q.question || "");
      questionFormPayload.append(`questions[${index}][option][0]`, q.optionA || "");
      questionFormPayload.append(`questions[${index}][option][1]`, q.optionB || "");
      questionFormPayload.append(`questions[${index}][option][2]`, q.optionC || "");
      questionFormPayload.append(`questions[${index}][option][3]`, q.optionD || "");
      questionFormPayload.append(`questions[${index}][correct_ans]`, q.correctAnswer || "");
      questionFormPayload.append(`questions[${index}][explation]`, q.explanation || "");
      questionFormPayload.append(`questions[${index}][marks]`, q.marks || "");
    });
    const addPayload = spoofedFormData("POST", questionFormPayload);
    const addResponse = await apiClient.post(API.QUESTION_ANS_ADD, addPayload, formConfig);
    const createdRows = extractRows(addResponse.data);
    savedQuestions = cleanedQuestions.map((q, index) => ({
      ...q,
      id: createdRows[index]?.id ?? q.id,
    }));
  } else {
    // 👇 Update mode: existing (id waale) aur naye (id na waale) ko alag-alag bhejo
    const existingQuestions = cleanedQuestions.filter((q) => q.id);
    const newQuestions = cleanedQuestions.filter((q) => !q.id);

    let updatedExisting = existingQuestions;
    if (existingQuestions.length) {
      const updateFormPayload = new FormData();
      updateFormPayload.append("quiz_type_id", quizTypeId);
      updateFormPayload.append("group_key", groupKey);
      existingQuestions.forEach((q, index) => {
        updateFormPayload.append(`questions[${index}][id]`, q.id);
        updateFormPayload.append(`questions[${index}][question]`, q.question || "");
        updateFormPayload.append(`questions[${index}][option][0]`, q.optionA || "");
        updateFormPayload.append(`questions[${index}][option][1]`, q.optionB || "");
        updateFormPayload.append(`questions[${index}][option][2]`, q.optionC || "");
        updateFormPayload.append(`questions[${index}][option][3]`, q.optionD || "");
        updateFormPayload.append(`questions[${index}][correct_ans]`, q.correctAnswer || "");
        updateFormPayload.append(`questions[${index}][explation]`, q.explanation || "");
        updateFormPayload.append(`questions[${index}][marks]`, q.marks || "");
      });
      const updatePayload = spoofedFormData("PUT", updateFormPayload);
      await apiClient.post(endpoint(API.QUESTION_ANS_UPDATE, quizTypeId), updatePayload, formConfig);
    }

    let createdNew = [];
    if (newQuestions.length) {
      const addFormPayload = new FormData();
      addFormPayload.append("quiz_type_id", quizTypeId);
      addFormPayload.append("group_key", groupKey);
      newQuestions.forEach((q, index) => {
        addFormPayload.append(`questions[${index}][question]`, q.question || "");
        addFormPayload.append(`questions[${index}][option][0]`, q.optionA || "");
        addFormPayload.append(`questions[${index}][option][1]`, q.optionB || "");
        addFormPayload.append(`questions[${index}][option][2]`, q.optionC || "");
        addFormPayload.append(`questions[${index}][option][3]`, q.optionD || "");
        addFormPayload.append(`questions[${index}][correct_ans]`, q.correctAnswer || "");
        addFormPayload.append(`questions[${index}][explation]`, q.explanation || "");
        addFormPayload.append(`questions[${index}][marks]`, q.marks || "");
      });
      const addPayload = spoofedFormData("POST", addFormPayload);
      const addResponse = await apiClient.post(API.QUESTION_ANS_ADD, addPayload, formConfig);
      const createdRows = extractRows(addResponse.data);
      createdNew = newQuestions.map((q, index) => ({
        ...q,
        id: createdRows[index]?.id ?? q.id,
      }));
    }

    savedQuestions = [...updatedExisting, ...createdNew];
  }
}

const apiRow = extractSavedRow(response.data, "quiz");
const mergedRow = { ...record, id: quizTypeId, quizTypeId, questions: savedQuestions.length ? savedQuestions : record.questions };
  if (apiRow && typeof apiRow === "object") {
    Object.entries(apiRow).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") mergedRow[key] = value;
    });
  }
  return normalizeModuleRow("quiz")(mergedRow);
};
const deleteQuestionFromApi = (row) => {
  const payload = spoofedFormData("DELETE");
  return apiClient.post(endpoint(API.QUESTION_ANS_DELETE, row), payload, { headers: apiHeaders(), timeout: 12000 });
};

const restoreQuestionFromApi = (row) => {
  const payload = spoofedFormData("PATCH");
  return apiClient.post(endpoint(API.QUESTION_ANS_RESTORE, row), payload, { headers: apiHeaders(), timeout: 12000 });
};
const isRestorableQuizRow = (slug, row = {}) =>
  (slug === "quiz" || slug === "quiz-subscription-create") && isDeletedRow(row);


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
  const storedRows = getStoredRows(slug).filter((row) => !isStaticDummyRow(row));
  if (storedRows.length !== getStoredRows(slug).length) {
    saveStoredRows(slug, storedRows);
  }
  const storedKeys = new Set(storedRows.map(rowKey));
  const deletedKeys = new Set(getDeletedKeys(slug));
  const baseRows = (getConfig(dataSlug(slug)).rows || getConfig(slug).rows || [])
    .filter((row) => !isStaticDummyRow(row))
    .filter((row) => !storedKeys.has(rowKey(row)))
    .filter((row) => !deletedKeys.has(rowKey(row)));
  return [...storedRows, ...baseRows].filter((row) => row && typeof row === "object" && !isDeletedRow(row));
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
// const activeRow = (slug) => {
//   const rows = getRows(slug);
//   const activeKey = sessionStorage.getItem(activeRecordKey(slug));
//   return rows.find((row) => rowKey(row) === activeKey) || rows[0] || {};
// };
const activeRow = (slug) => {
  const rows = getRows(slug);
  const activeKey = sessionStorage.getItem(activeRecordKey(slug));
  const found = rows.find((row) => rowKey(row) === activeKey);
  if (found && resolveRecordIdentifier(found)) return found;
  try {
    const snapshot = JSON.parse(sessionStorage.getItem(`${activeRecordKey(slug)}-snapshot`) || "null");
    if (snapshot) return snapshot;
  } catch {}
  return found || rows[0] || {};
};
const pickRecordTitle = (row) => {
  const record = row || {};
  return record.sellerName || record.name || record.username || record.title || record.productName || record.officeName || record.userId || record.transactionId || record.id || "this record";
};

const pickRecordSubTitle = (row) => {
  const record = row || {};
  return record.email || record.phone || record.orderId || record.transactionId || record.userType || record.category || record.amount || "";
};

const mobilePrimaryText = (row = {}) => {
  const title = row.title || row.sellerName || row.name || row.username || row.productName || row.adTitle || row.adName || row.product || row.officeName || row.userName || (typeof row.user === "string" ? row.user : "") || row.viewerName || row.id || "Record";
  const category = row.category || row.location || "";
  return category ? `${title} • ${category}` : title;
};

const mobileSecondaryText = (row = {}) => {
  const candidates = [
    
    row.userId, row.productId, row.profileId, row.transactionId,
    row.orderId, row.adId, row.planTitle, row.viewerProfile,
    row.email, row.phone, row.id,
  ];
  
  return candidates.find((value) => typeof value === "string" || typeof value === "number") || "";
  
};

const mobileMetaText = (row = {}) =>
  row.phone || row.contact || row.email || row.category || row.location || row.amount || row.views || row.totalViews || row.totalEnquiries || row.days || row.createdAt || row.date || row.viewDate || "";

const isPositiveStatus = (status) => normalizeStatus(status) === "Active";
const nextStatusForSlug = (slug, status = "Active") => {
  return isPositiveStatus(status) ? "Inactive" : "Active";
};
const statusBadge = (status) => {
  const normalizedStatus = normalizeStatus(status);
  const variant = normalizedStatus === "Active" ? "success"
    : normalizedStatus === "Pending" ? "warning"
    : "danger";
  return (
    <span className={`badge light badge-${variant}`}>
      {normalizedStatus || "Active"}
    </span>
  );
};
const logStatusChange = (row, status) => {
  const numericStatus = Number(normalizeStatusValue(status));
  console.log("status", pickRecordTitle(row), status, numericStatus);
};

const StatusToggle = ({ status = "Active", onClick = () => { } }) => (
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
  const hasActiveFilters = Object.values(values || {}).some((value) => String(value || "").trim());
  const statusOptions = slug === "withdrawal" ? ["Pending", "Approved", "Processing", "Paid", "Rejected", "Cancelled"]
  : slug === "quiz-attempts" ? ["Completed", "In Progress"]
  : slug === "profile-update-requests" ? ["Pending", "Approved", "Rejected"]
 : PAYMENT_LIST_SLUGS.includes(slug) ? ["Created", "Paid", "Failed"]
  : ["Active", "Inactive"];
  const selectFilters = {
    state: ["State", stateOptions],
    district: ["District", getAllStatesWithDistricts().flatMap((item) => item.districts)],
    source: ["Source", ["Referral", "Ads Credit", "Ecom", "Manual"]],
    taluka: ["Taluka", defaultTalukas],
    status: ["Status", statusOptions],
    type: ["Type", slug === "payment-history" ? ["Role", "Ads", "Ecom", "Quiz"] : ["Role", "Ads", "Ecom"]],
    filterStatus: ["Filter Status", statusOptions],
    category: ["Category", newsCategories],
    subject: ["Subject", ["RTI", "BNS", "Journalism"]],
    difficulty: ["Difficulty", ["Easy", "Medium", "Hard"]],
    testType: ["Test Type", ["Practice (20 Q)", "Training (50 Q)", "Exam (100 Q)"]],
    correctAnswer: ["Correct Answer", ["A", "B", "C", "D"]],
    userType: ["User Type", ["Free", "Premium", "All Users", "Premium Users", "Inactive Users"]],
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-outline-primary btn-sm rti-filter-header-btn"
        onClick={() => setOpen(true)}
      >
        <i className="fas fa-filter me-2" />
        Filters
      </button>
      <Modal show={open} onHide={() => setOpen(false)} centered dialogClassName="rti-filter-modal">
        <Modal.Header closeButton>
          <Modal.Title>Filters</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row filter-row">
            {filters.includes("search") && (
              <div className="col-md-6 col-12">
                <input className="form-control mb-3" type="search" placeholder="Search..." value={values.search} onChange={(event) => onChange("search", event.target.value)} />
              </div>
            )}
{(PAYMENT_LIST_SLUGS.includes(slug) || slug === "quiz-attempts") && (
              <div className="col-md-6 col-12">
                <input className="form-control mb-3" type="number" min="1" placeholder="User ID (server filter)" value={values.apiUserId || ""} onChange={(event) => onChange("apiUserId", event.target.value)} />
              </div>
            )}
            {PURCHASER_SLUGS.includes(slug) && (
              <div className="col-md-6 col-12">
                <input className="form-control mb-3" type="number" min="1" placeholder="Plan ID (specific plan purchasers)" value={values.apiPlanId || ""} onChange={(event) => onChange("apiPlanId", event.target.value)} />
              </div>
            )}
            {Object.entries(selectFilters).map(([name, [label, options]]) => filters.includes(name) && (
              <div className="col-md-6 col-12" key={name}>
                <Select
                  isSearchable={false}
                  options={toSelectOptions(options)}
                  className="custom-react-select mb-3"
                  classNamePrefix="rti-react-select"
                  isClearable
                  placeholder={label}
                  value={values[name] ? selectOption(values[name]) : null}
                  onChange={(option) => onChange(name, option?.value || "")}
                />
              </div>
            ))}
            <div className="col-md-6 col-12">
              <input type="date" name="datepicker" className="form-control mb-3" value={values.dateFilter} onChange={(event) => onChange("dateFilter", event.target.value)} />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          {hasActiveFilters && <button className="btn btn-danger light" type="button" onClick={onReset}>Remove</button>}
          <button className="btn btn-primary" type="button" onClick={() => setOpen(false)}>
            <i className="fa fa-search me-1" />
            Filter
          </button>
        </Modal.Footer>
      </Modal>
    </>
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
  sessionStorage.setItem(`${activeRecordKey(slug)}-snapshot`, JSON.stringify(row)); // NEW
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

const pdfHref = (row = {}, field = "pdfFiles") =>
  row[`${field}Url`] || row.pdfFilesUrl || row.pdfUrl || row.fileUrl || row.url || "";

// Withdrawal delete backend sirf paid / rejected / cancelled par allow karta hai (baaki par 422 withdrawal_active)
const DELETABLE_WITHDRAWAL_STATUSES = ["paid", "rejected", "cancelled"];

const ActionButtons = ({ slug, actions, row, onDelete, onStatus, onApprove, onReject }) => {
  const linkSlug = slug === "dashboard" ? "user-profile" : slug; 
  const canDelete = slug !== "withdrawal" || DELETABLE_WITHDRAWAL_STATUSES.includes(String(row.status || "").trim().toLowerCase());
  return (
    <div className="rti-action-buttons" onClick={(event) => event.stopPropagation()}>
    {actions.includes("generatePdf") && (
      <a href={pdfHref(row) || "#"} target="_blank" rel="noreferrer" className={`btn btn-secondary shadow btn-xs sharp ${pdfHref(row) ? "" : "disabled"}`} aria-disabled={!pdfHref(row)}>
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
    {actions.includes("approve") && (
      <button
        type="button"
        onClick={() => onApprove(row)}
        className="btn btn-success shadow btn-xs sharp"
        title="Approve"
        disabled={String(row.status || "").toLowerCase() !== "pending"}
      >
        <i className="fa fa-check" />
      </button>
    )}
    {actions.includes("reject") && (
      <button
        type="button"
        onClick={() => onReject(row)}
        className="btn btn-danger shadow btn-xs sharp"
        title="Reject"
        disabled={String(row.status || "").toLowerCase() !== "pending"}
      >
        <i className="fa fa-times" />
      </button>
    )}
    {actions.includes("delete") && canDelete && (
      <button type="button" onClick={() => onDelete(row)} className="btn btn-danger shadow btn-xs sharp" title="Delete">
        <i className="fa fa-trash" />
      </button>
    )}
  </div>
);
};
const CellValue = ({ field, row, slug, onImage }) => {
  if (field === "profileImage") {
    return <button type="button" className="rti-image-button" onClick={() => onImage(row.image || row.profile_image || profile)}><img src={row.image || row.profile_image || profile} alt={row.name} className="rounded-circle" width="38" height="38" /></button>;
  }
  if (field === "imageThumb") {
    return <button type="button" className="rti-image-button" onClick={() => onImage(row.image || row.profile_image || profile)}><img src={row.image || row.profile_image || profile} alt={row.product} className="rounded" width="44" height="34" /></button>;
  }
  if (field === "productImage") {
    return <button type="button" className="rti-image-button" onClick={() => onImage(row.productImage || row.image || profile)}><img src={row.productImage || row.image || profile} alt={row.productName || "Product"} className="rounded" width="44" height="34" /></button>;
  }
   if (field === "status") {
    return ["profile-update-requests", "withdrawal", "wallets"].includes(slug) ? requestStatusBadge(row.status) : statusBadge(row.status);
  }
  if (field === "attemptStatus") {
    const done = String(row.attemptStatus || "").toLowerCase() === "completed";
    return <span className={`badge light badge-${done ? "success" : "warning"}`}>{row.attemptStatus || "-"}</span>;
  }
  if (field === "result") {
    const normalizedResult = String(row.result || "").toLowerCase();
    const variant = normalizedResult === "pass" ? "success" : normalizedResult === "fail" ? "danger" : "secondary";
    return <span className={`badge light badge-${variant}`}>{row.result || "-"}</span>;
  }
  if (field === "pdfFiles") {
    const href = pdfHref(row, field);
    return (
      <a href={href || "#"} target="_blank" rel="noreferrer" className={href ? "text-primary" : "text-muted"} onClick={(event) => event.stopPropagation()} aria-disabled={!href}>
        <i className="fa fa-file-pdf me-1" />
        {row.pdfFiles}
      </a>
    );
  }
  const fallbackValue = field === "name" ? [row.firstname, row.lastname].filter(Boolean).join(" ").trim() || row.username || "" : "";
  const value = row[field] || fallbackValue || "-";
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

const ConfirmModal = ({ show, title, message, intent = "status", confirmText = "Yes", onHide, onConfirm }) => (
  <>
    <style>{`
      .rti-glass-confirm-modal {
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
      .rti-glass-confirm-modal .modal-dialog {
        max-width: 24rem;
      }
      .rti-glass-confirm-modal .modal-content {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.8);
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        border-radius: 20px;
      }
      .rti-glass-confirm-modal .modal-header {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.3) 100%);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.6);
        border-bottom: none;
        border-radius: 20px 20px 0 0;
        padding: 1.5rem;
        text-align: center;
      }
      .rti-glass-confirm-modal .modal-header.bg-danger {
        background: linear-gradient(135deg, rgba(220, 53, 69, 0.7) 0%, rgba(220, 53, 69, 0.5) 100%);
      }
      .rti-glass-confirm-modal .modal-header.bg-primary {
        background: linear-gradient(135deg, rgba(0, 123, 255, 0.7) 0%, rgba(0, 123, 255, 0.5) 100%);
      }
      .rti-glass-confirm-modal .modal-body {
        background: transparent;
        text-align: center;
        padding: 2rem 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100px;
      }
      .rti-glass-confirm-modal .modal-body::before {
        content: '';
        display: block;
        width: 60px;
        height: 60px;
        margin-bottom: 1rem;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .rti-glass-confirm-modal .modal-body p {
        font-size: 1rem;
        color: #333;
        margin: 0;
        font-weight: 500;
      }
      .rti-glass-confirm-modal .modal-footer {
        background: transparent;
        border: none;
        text-align: center;
        justify-content: center;
        gap: 1rem;
        padding: 1.5rem;
      }
      .rti-glass-confirm-modal .btn {
        min-width: 100px;
        font-weight: 500;
        border-radius: 10px;
        border: none;
      }
      .rti-glass-confirm-modal .btn-light {
        background: rgba(255, 255, 255, 0.8);
        color: #333;
        transition: all 0.3s ease;
      }
      .rti-glass-confirm-modal .btn-light:hover {
        background: rgba(255, 255, 255, 0.95);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      }
      .rti-glass-confirm-modal .btn-primary {
        background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
        box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
      }
      .rti-glass-confirm-modal .btn-primary:hover {
        box-shadow: 0 12px 30px rgba(0, 123, 255, 0.4);
      }
      .rti-glass-confirm-modal .btn-danger {
        background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
        box-shadow: 0 8px 20px rgba(220, 53, 69, 0.3);
      }
      .rti-glass-confirm-modal .btn-danger:hover {
        box-shadow: 0 12px 30px rgba(220, 53, 69, 0.4);
      }
      .rti-glass-confirm-modal .btn-close {
        background-color: rgba(0, 0, 0, 0.3);
      }
    `}</style>
    <Modal show={show} onHide={onHide} centered backdrop="static" keyboard={false} size="sm" contentClassName="rti-glass-confirm-modal">
      <Modal.Header closeButton className={intent === "delete" ? "bg-danger text-white border-0" : "bg-primary text-white border-0"} style={{ textAlign: "center" }}>
        <Modal.Title className="w-100 text-center">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center" style={{ textAlign: "center" }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem' }}>
          {intent === "delete" ? (
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(220, 53, 69, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa fa-trash text-danger" style={{ fontSize: '1.5rem' }} />
            </div>
          ) : (
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(0, 123, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa fa-info-circle text-primary" style={{ fontSize: '1.5rem' }} />
            </div>
          )}
        </div>
        <p className="mb-0">{message}</p>
      </Modal.Body>
      <Modal.Footer className="justify-content-center text-center" style={{ justifyContent: "center", textAlign: "center", gap: '1rem' }}>
        <button type="button" className="btn btn-light" onClick={onHide}>No</button>
        <button type="button" className={`btn ${intent === "delete" ? "btn-danger" : "btn-primary"}`} onClick={() => {
          onConfirm();
          onHide();
        }}>{confirmText}</button>
      </Modal.Footer>
    </Modal>
  </>
);

const ImageModal = ({ image, onHide }) => (
  <Modal show={Boolean(image)} onHide={onHide} centered>
    <Modal.Body className="text-center">
      <img src={image} alt="Preview" className="rti-preview-image" />
    </Modal.Body>
  </Modal>
);
const RejectReasonModal = ({ show, row, onHide, onConfirm }) => {
  const [reason, setReason] = useState("");
  useEffect(() => { if (show) setReason(""); }, [show]);
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Reject Request</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-2">
          {row?.withdrawalNumber ? "Reject withdrawal" : "Reject profile update request from"} <strong>{row?.withdrawalNumber || row?.user_name || "this user"}</strong>?
        </p>
        <label className="form-label">Reason for rejection (user ko yeh dikhega)</label>
        <textarea
          className="form-control"
          rows={4}
          placeholder="e.g. Yeh mobile number already dusre account se linked hai."
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-light" onClick={onHide}>Cancel</button>
        <button
          type="button"
          className="btn btn-danger"
          disabled={!reason.trim()}
          onClick={() => { onConfirm(reason.trim()); onHide(); }}
        >
          Reject Request
        </button>
      </Modal.Footer>
    </Modal>
  );
};
export const ModuleList = ({ slug }) => {
  const config = getConfig(slug);
  const navigate = useNavigate();
 const [moduleRows, setModuleRows] = useState(() => {
    const baseRows = LIVE_API_SLUGS.includes(slug) ? [] : sortRowsNewestFirst(getRows(slug));
    return slug === "profile-update-requests" ? baseRows.map(summarizeProfileUpdateRequest) : baseRows;
  });
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
    apiUserId: "",
    apiPlanId: "",
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
  const [approveRow, setApproveRow] = useState(null);
  const [rejectRow, setRejectRow] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(LIVE_API_SLUGS.includes(slug));
  const [dashboardStats, setDashboardStats] = useState(null);
  const [toast, setToast] = useState(() => {
    const message = sessionStorage.getItem("moduleToast");
    if (message) {
      sessionStorage.removeItem("moduleToast");
    }
    return message || "";
  });

  useEffect(() => {
    const persistedToast = sessionStorage.getItem("moduleToast");
    if (persistedToast) {
      sessionStorage.removeItem("moduleToast");
      setToast((currentToast) => currentToast === persistedToast ? currentToast : persistedToast);
    }
  }, [slug]);
 


  useEffect(() => {
    if (!USER_API_SLUGS.includes(slug)) return;
    let active = true;
    Promise.resolve().then(() => {
      if (active) setIsLoading(true);
    });
  loadUsersFromApi(slug)
      .then(({ rows: apiRows, stats }) => {
        if (!active) return;
        const combinedRows = sortRowsNewestFirst(apiRows);
        if (combinedRows.length) {
          setModuleRows(combinedRows);
          saveStoredRows(dataSlug(slug), combinedRows);
        }
        if (stats) setDashboardStats(stats);
      })
      .catch((error) => {
        if (active) setToast(apiMessage(error, "Unable to load data from server"));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!MODULE_API_SLUGS.includes(slug) || PAYMENT_LIST_SLUGS.includes(slug) || slug === "quiz-attempts") return;
    let active = true;
    // List pages use their all-users index endpoints; pagination only.
    const extraParams = ["wallets", "withdrawal"].includes(slug) ? { per_page: 100 } : {};
    Promise.resolve().then(() => {
      if (active) setIsLoading(true);
    });
  loadModuleFromApi(slug, extraParams)
  .then((apiRows) => {
    if (!active) return;
    const validApiRows = apiRows.filter((row) => row.id); // ✅ sirf real id wale rows
    const combinedRows = sortRowsNewestFirst(mergeRowsByKey(
    [], // ✅ stored rows bhi filter, _local wale (newly added, pending) allow
      validApiRows
    ));
  if (Array.isArray(combinedRows)) {
      setModuleRows(combinedRows);
      saveStoredRows(slug, combinedRows);
    }
  })
      .catch((error) => {
        if (active) setToast(apiMessage(error, "Unable to load data from server"));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  // Quiz attempts: table open hote hi saare users ke attempts; User ID filter = server-side (?user_id=)
  useEffect(() => {
    if (slug !== "quiz-attempts") return;
    let active = true;
    const userId = String(filters.apiUserId || "").trim();
    const timer = setTimeout(() => {
      setIsLoading(true);
      loadQuizAttemptsModule({ userId })
        .then((apiRows) => {
          if (!active) return;
          const sorted = sortRowsNewestFirst(apiRows.filter((row) => row.id));
          setModuleRows(sorted);
          saveStoredRows(slug, sorted);
        })
        .catch((error) => {
          if (!active) return;
          setModuleRows([]);
          setToast(apiMessage(error, "Unable to load quiz attempts from server"));
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    }, userId ? 500 : 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [slug, filters.apiUserId]);

  // Payment history + purchasers (server-side user_id / plan filter)
  useEffect(() => {
    if (!PAYMENT_LIST_SLUGS.includes(slug)) return;
    let active = true;
    const userId = String(filters.apiUserId || "").trim();
    const planId = String(filters.apiPlanId || "").trim();
    const timer = setTimeout(() => {
      setIsLoading(true);
      loadPaymentModule(slug, { userId, planId })
        .then((apiRows) => {
          if (!active) return;
          const sorted = sortRowsNewestFirst(apiRows);
          setModuleRows(sorted);
          saveStoredRows(slug, sorted);
        })
        .catch((error) => {
          if (!active) return;
          setModuleRows([]);
          setToast(apiMessage(error, "Unable to load data from server"));
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    }, userId || planId ? 500 : 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [slug, filters.apiUserId, filters.apiPlanId]);

 const filteredRows = useMemo(() => {
    const sourceRows = [...moduleRows];
    return sourceRows.filter((row) => {
     // 1 week filter removed
      const haystack = Object.values(row).join(" ").toLowerCase();
      const dateHaystack = Object.values(row).map((value) => formatDisplayDate(value) || value).join(" ").toLowerCase();
      if (cardFilter === "active" && row.status !== "Active") return false;
      if (cardFilter === "inactive" && row.status !== "Inactive") return false;
      if (
        cardFilter === "premium" &&
        row.userType !== "Premium" &&
        row.planName !== "Premium" &&
        row.subscriptionStatus !== "Active"
      ) return false;
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
     const directFilters = ["id", "userId", "username", "transactionId", "amount", "orderId", "title", "author", "role", "state", "district", "taluka", "adId", "product", "officeName", "email", "publishDate", "testType", "type"]; // 👈 "type" added
      if (directFilters.some((field) => filters[field] && !String(row[field] || "").toLowerCase().includes(filters[field].toLowerCase()))) return false;
      return true;
    });
 }, [cardFilter, moduleRows, filters, slug]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / 10));
  const pageWindowSize = 5;
  const clampedPage = Math.min(Math.max(page, 1), totalPages);
  const windowStart = Math.max(1, Math.min(clampedPage, totalPages - pageWindowSize + 1));
  const paginationPages = Array.from({ length: Math.min(pageWindowSize, totalPages - windowStart + 1) }, (_, index) => windowStart + index);
  const rows = filteredRows.slice((clampedPage - 1) * 10, clampedPage * 10);
  const onFilterChange = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setPage(1);
  };
  const resetFilters = () => {
    setFilters((current) => Object.fromEntries(Object.keys(current).map((key) => [key, ""])));
    setPage(1);
  };
  // const openRowView = (row) => {
  //   if (!config.actions?.includes("view")) return;
  //   setActiveRecord(slug, row);
  //   navigate(`/admin/${slug}/view`);
  // };
  const openRowView = (row) => {
  if (!config.actions?.includes("view")) return;
  setActiveRecord(slug, row);
  navigate(`/admin/${slug === "dashboard" ? "user-profile" : slug}/view`); // 👈 change
};

  const addLabel =
    slug === "user-profile" ? "Add User" :
      slug === "news" ? "Add News" :
        slug === "advertisement" ? "Add Advertisement" :
          slug === "ecommerce-subscription" ? "Add Plan" :
            slug === "ads-subscription" ? "Add Plan" :
              slug === "offices-addresses" ? "Add Office Address" :
                slug === "e-paper" ? "Add E-Paper" :
                  slug === "subscription-plan" ? "Add Subscription" :
                    slug === "quiz" ? "Add Quiz" :
                      slug === "news-notification" ? "Add Notification" :
                        slug === "quiz-subscription-create" ? "Create Subscription" :
                        "Add";

  const liveStats = useMemo(() => {
    if (slug !== "dashboard" || !config.stats) return config.stats;
    return config.stats.map(([label, , icon, color, key]) => {
      const apiCount = dashboardStats?.[key];
      const count = apiCount !== null && apiCount !== undefined
        ? apiCount
        : key === "all"
          ? moduleRows.length
          : key === "active"
            ? moduleRows.filter((row) => row.status === "Active").length
            : key === "inactive"
              ? moduleRows.filter((row) => row.status === "Inactive").length
              : key === "premium"
                ? moduleRows.filter((row) => (
                  row.userType === "Premium" ||
                  row.planName === "Premium" ||
                  row.subscriptionStatus === "Active"
                )).length
                : 0;
      return [label, String(count), icon, color, key];
    });
  }, [config.stats, dashboardStats, moduleRows, slug]);

  return (
    <div className="row">
      <div className="col-12">
        <PageHeading title={config.title} />
      </div>
      <AppToast show={Boolean(toast)} message={toast} onClose={() => setToast("")} />
      {config.stats && <DashboardCards stats={liveStats} selected={cardFilter} onSelect={setCardFilter} />}
      <div className="col-12">
        <div className="card rti-module-table-card">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
            <h4 className="card-title mb-0 rti-table-title-tab">{config.title} List</h4>
            <div className="rti-table-header-actions">
              <FilterBar filters={config.filters} values={filters} onChange={onFilterChange} onReset={resetFilters} slug={slug} />
              {config.add && (
                <Link to={`/admin/${slug}/add`} className="btn btn-primary btn-sm">
                  <i className="fa fa-plus me-2" />
                  {addLabel}
                </Link>
              )}
            </div>
          </div>
          <div className="card-body">
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
                  {isLoading && (
                    <tr>
                      <td colSpan={config.columns.length + 1} className="text-center py-4">
                        <span className="spinner-border spinner-border-sm me-2" />
                        Loading...
                      </td>
                    </tr>
                  )}
                  {!isLoading && !rows.length && (
                    <tr>
                      <td colSpan={config.columns.length + 1} className="text-center py-4">No records found</td>
                    </tr>
                  )}
                  {rows.map((row, rowIndex) => {
                    const displayRow = { ...row, sr: (clampedPage - 1) * 10 + rowIndex + 1 };
                    return (
                    <tr 
  key={`${slug}-${row.sr || row.id || rowIndex}-${rowIndex}`} className="rti-clickable-row"  onClick={() => openRowView(row)}>
                        {config.columns.map(([field]) => (
                          <td key={field}>
                            <CellValue field={field} row={displayRow} slug={slug} onImage={setImagePreview} />
                          </td>
                        ))}
                        <td>
                         <ActionButtons slug={slug} actions={config.actions} row={row} onDelete={setDeleteRow} onStatus={setStatusRow} onApprove={setApproveRow} onReject={setRejectRow} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="rti-mobile-table">
              {isLoading && (
                <div className="text-center py-4">
                  <span className="spinner-border spinner-border-sm me-2" />
                  Loading...
                </div>
              )}
              {!isLoading && !rows.length && <div className="text-center py-4">No records found</div>}
              {!isLoading && rows.map((row, rowIndex) => (
                <div className="card border mb-2 rti-clickable-row" key={`mobile-${slug}-${row.sr || row.id || rowIndex}-${rowIndex}`} onClick={() => openRowView(row)}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between gap-2">
                      <strong>{mobilePrimaryText(row)}</strong>
                      {row.status && (["wallets", "withdrawal"].includes(slug) ? requestStatusBadge(row.status) : slug === "quiz-attempts" ? CellValue({ field: "attemptStatus", row }) : statusBadge(row.status))}
                    </div>
                    <p className="mb-1">{mobileSecondaryText(row) || row.id || "-"}</p>
                    <p className="mb-3">{mobileMetaText(row) || "-"}</p>
                  <ActionButtons slug={slug} actions={config.actions} row={row} onDelete={setDeleteRow} onStatus={setStatusRow} onApprove={setApproveRow} onReject={setRejectRow} />
                  </div>
                </div>
              ))}
            </div>
            <nav className="mt-3 d-flex justify-content-center">
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button className="page-link" type="button" onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
                </li>
                {windowStart > 1 && (
                  <>
                    <li className="page-item">
                      <button className="page-link" type="button" onClick={() => setPage(1)}>1</button>
                    </li>
                    <li className="page-item disabled">
                      <span className="page-link">…</span>
                    </li>
                  </>
                )}
                {paginationPages.map((pageNumber) => (
                  <li className={`page-item ${page === pageNumber ? "active" : ""}`} key={pageNumber}>
                    <button className="page-link" type="button" onClick={() => setPage(pageNumber)}>{pageNumber}</button>
                  </li>
                ))}
                {paginationPages[paginationPages.length - 1] < totalPages && (
                  <>
                    <li className="page-item disabled">
                      <span className="page-link">…</span>
                    </li>
                    <li className="page-item">
                      <button className="page-link" type="button" onClick={() => setPage(totalPages)}>{totalPages}</button>
                    </li>
                  </>
                )}
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
        message={
          slug === "quiz-attempts"
            ? `Delete quiz attempt #${deleteRow?.id || ""} of ${deleteRow?.username || "this user"}? It will also disappear from the user's quiz history.`
            : slug === "withdrawal"
              ? `Delete withdrawal ${deleteRow?.withdrawalNumber || ""} (${deleteRow?.amount || "-"}) of ${deleteRow?.userName || "this user"}?`
              : `Are you sure you want to delete ${pickRecordTitle(deleteRow)}?`
        }
        confirmText="Delete"
        variant="danger"
        onHide={() => setDeleteRow(null)}
        onConfirm={async () => {
          const rowToDelete = deleteRow;
          try {
       if (slug === "user-profile" || slug === "dashboard") {
  await deleteUserFromApi(rowToDelete);
} else if (slug === "question-bank") {
  await deleteQuestionFromApi(rowToDelete);
} else if (slug === "quiz-subscription-create") {          // 👈 NAYA
  await deleteQuizSubscriptionPlanFromApi(rowToDelete);
} else if (MODULE_API_SLUGS.includes(slug)) {
  await deleteModuleFromApi(slug, rowToDelete);
}
            const deletedKey = resolveRecordIdentifier(rowToDelete);
            setModuleRows((currentRows) => {
              const nextRows = currentRows.filter((item) => resolveRecordIdentifier(item) !== deletedKey);
              saveStoredRows(slug, nextRows);
              return nextRows;
            });
            saveDeletedKeys(slug, Array.from(new Set([...getDeletedKeys(slug), deletedKey])));
            sessionStorage.removeItem(activeRecordKey(slug));
            setDeleteRow(null);
            setToast(
              slug === "quiz-attempts" ? "Quiz attempt deleted successfully."
                : slug === "withdrawal" ? "Withdrawal deleted successfully."
                  : `${pickRecordTitle(rowToDelete)} deleted successfully`
            );
          } catch (error) {
            setDeleteRow(null);
            setToast(apiMessage(error, "Delete failed. Please check server response."));
          }
        }}
      />
    <ConfirmModal
        show={Boolean(statusRow)}
        title="Status Confirmation"
        row={statusRow}
        message={`Do you want to change ${pickRecordTitle(statusRow)} from ${statusRow?.status || "Active"} to ${nextStatusForSlug(slug, statusRow?.status || "Active")}?`}
        confirmText="Yes"
        onHide={() => setStatusRow(null)}
        onConfirm={async () => {
          const rowToUpdate = statusRow;
          const nextStatus = nextStatusForSlug(slug, rowToUpdate?.status || "Active");
          logStatusChange(rowToUpdate, nextStatus);
          try {
          if (slug === "user-profile" || slug === "dashboard") {
  await updateUserStatusInApi(rowToUpdate, nextStatus);
} else if (slug === "quiz-subscription-create") {          // 👈 NAYA
  await updateQuizSubscriptionPlanStatusInApi(rowToUpdate, nextStatus);
} else if (MODULE_API_SLUGS.includes(slug)) {
  await updateModuleStatusInApi(slug, rowToUpdate, nextStatus);
}
            setModuleRows((currentRows) => {
              const nextRows = currentRows.map((item) => resolveRecordIdentifier(item) === resolveRecordIdentifier(rowToUpdate) ? { ...item, status: nextStatus } : item);
              saveStoredRows(slug, nextRows);
              return nextRows;
            });
            setStatusRow(null);
            setToast(`${pickRecordTitle(rowToUpdate)} status updated successfully`);
          } catch (error) {
            setStatusRow(null);
            setToast(apiMessage(error, "Status update failed. Please check server response."));
          }
        }}
      />
         <ConfirmModal
        show={Boolean(approveRow)}
        title="Approve Confirmation"
        row={approveRow}
        message={slug === "withdrawal" ? `Approve withdrawal ${approveRow?.withdrawalNumber} of ${approveRow?.amount}?` : `Approve profile update request from ${approveRow?.user_name || "this user"}?`}
        confirmText="Approve"
        onHide={() => setApproveRow(null)}
        onConfirm={async () => {
          const rowToApprove = approveRow;
          try {
            if (slug === "withdrawal") {
              await approveWithdrawalInApi(rowToApprove);
              const approvedId = resolveRecordIdentifier(rowToApprove);
              setModuleRows((currentRows) => {
                const nextRows = currentRows.map((item) => resolveRecordIdentifier(item) === approvedId ? { ...item, status: "Approved" } : item);
                saveStoredRows(slug, nextRows);
                return nextRows;
              });
              setApproveRow(null);
              setToast(`Withdrawal ${rowToApprove.withdrawalNumber} approved`);
              return;
            }
            await approveProfileRequestInApi(rowToApprove);
            // Approve hote hi pending list se hat jata hai (backend ab isko pending nahi maanta)
            const approvedKey = resolveRecordIdentifier(rowToApprove);
            setModuleRows((currentRows) => {
              const nextRows = currentRows.filter((item) => resolveRecordIdentifier(item) !== approvedKey);
              saveStoredRows(slug, nextRows);
              return nextRows;
            });
            setApproveRow(null);
            setToast(`Request from ${pickRecordTitle(rowToApprove)} approved successfully`);
          } catch (error) {
            setApproveRow(null);
            setToast(apiMessage(error, "Approve failed. Please check server response."));
          }
        }}
      />
      <RejectReasonModal
        show={Boolean(rejectRow)}
        row={rejectRow}
        onHide={() => setRejectRow(null)}
        onConfirm={async (reason) => {
          const rowToReject = rejectRow;
          try {
            if (slug === "withdrawal") {
              await rejectWithdrawalInApi(rowToReject, reason);
              const rejectedId = resolveRecordIdentifier(rowToReject);
              setModuleRows((currentRows) => {
                const nextRows = currentRows.map((item) => resolveRecordIdentifier(item) === rejectedId ? { ...item, status: "Rejected" } : item);
                saveStoredRows(slug, nextRows);
                return nextRows;
              });
              setRejectRow(null);
              setToast(`Withdrawal ${rowToReject.withdrawalNumber} rejected`);
              return;
            }
            await rejectProfileRequestInApi(rowToReject, reason);
            // Reject hote hi pending data (aur uploaded pending image) backend se delete ho jata hai
            const rejectedKey = resolveRecordIdentifier(rowToReject);
            setModuleRows((currentRows) => {
              const nextRows = currentRows.filter((item) => resolveRecordIdentifier(item) !== rejectedKey);
              saveStoredRows(slug, nextRows);
              return nextRows;
            });
            setRejectRow(null);
            setToast(`Request from ${pickRecordTitle(rowToReject)} rejected`);
          } catch (error) {
            setRejectRow(null);
            setToast(apiMessage(error, "Reject failed. Please check server response."));
          }
        }}
      />
      <ImageModal image={imagePreview} onHide={() => setImagePreview("")} />
    </div>
  );
};
    

const DetailGrid = ({ fields, row, onStatus, slug }) => (
  <div className="row">
    {fields.map((field) => (
      <div className={field === "description" || field === "bio" || field === "message" ? "col-12" : "col-xl-6"} key={field}>
        <div className="border-bottom py-3">
          <small className="text-muted d-block">{labels[field] || field}</small>
          <strong>
          {field === "status" ? (
  ["profile-update-requests", "withdrawal", "wallets"].includes(slug)
    ? requestStatusBadge(row[field])
    : <StatusToggle status={row[field] || "Active"} onClick={onStatus} />
) : field === "pdfFiles" ? (
              <a href={pdfHref(row, field) || "#"} target="_blank" rel="noreferrer" aria-disabled={!pdfHref(row, field)}>
                <i className="fa fa-file-pdf me-1" />
                {row[field] || labels[field]}
              </a>
            ) : field === "mediaFile" && row.mediaFileUrl ? (
              <a href={row.mediaFileUrl} target="_blank" rel="noreferrer">
                <i className="fa fa-paperclip me-1" />
                {row[field] || labels[field]}
              </a>
                       ) : field === "pendingProfileImage" ? (
              row.pendingProfileImage
                ? <img src={row.pendingProfileImage} alt="Pending profile" className="rti-detail-image" />
                : "-"
            ) : field === "productImage" ? (
              <img src={row.productImage || row.image || profile} alt={row.productName || "Product"} className="rti-detail-image" />
            ) : field === "profile_image" ? (
              row.image || row.profile_image ? (
                <img src={row.image || row.profile_image || profile} alt={row.name || row.username || "Profile"} className="rti-detail-image" />
              ) : (
                row[field] || "-"
              )
            ) : field === "bio" || (field === "description" && row.bio) ? (
              <span><strong>Bio:-</strong> {row.bio || row[field] || "-"}</span>
            ) : (
              row[field] || "-"
            )}
          </strong>
        </div>
      </div>
    ))}
  </div>
);

const ProfileDetailLayout = ({ row, config, onImage, onStatus }) => {
  const displayName = row.name || [row.firstname, row.lastname].filter(Boolean).join(" ").trim() || row.username || "User";
 const detailFields = config.profileView ? [...config.details.filter((field) => !["firstname", "lastname", "profile_image"].includes(field)), "pendingPhone", "pendingBio", "pendingProfileImage"].filter((field) => !field.startsWith("pending") || row[field]) : config.details;

  return (
    <div className="card rti-profile-details-card">
      <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <div>
            <button type="button" className="rti-image-button" onClick={() => onImage(row.image || row.profile_image || profile)}>
              <img src={row.image || row.profile_image || profile} alt={displayName} className="rounded-circle rti-profile-detail-avatar" />
            </button>
          </div>
          <div>
            <h4 className="card-title mb-1">{displayName}</h4>
            <p className="mb-0 text-muted">{row.profileId || row.userId}</p>
          </div>
        </div>
      </div>
      <div className="card-body">
        <DetailGrid fields={detailFields} row={row} onStatus={onStatus} />
        {config.profileView && (
          <div className="row mt-3">
         <div className="col-xl-6">
              <h5>Subscription Plan</h5>
              <p><strong>Plan Name:</strong> {row.planName || "-"}</p>
              <p><strong>Purchased Date:</strong> {row.subscriptionDate || "-"}</p>
              <p><strong>Status:</strong> {statusBadge(row.subscriptionStatus || "Inactive")}</p>
            </div>
            {(row.userIdPdfUrl || row.certificatePdfUrl || row.appointmentLetterPdfUrl) && <div className="col-xl-6">
              <h5>Documents</h5>
              <div className="d-flex flex-wrap gap-2">
                {[
                  ["User ID PDF", row.userIdPdfUrl],
                  ["Certification PDF", row.certificatePdfUrl],
                  ["Appointment Letter PDF", row.appointmentLetterPdfUrl],
                ].filter(([, href]) => href).map(([doc, href]) => (
                  <a href={href} target="_blank" rel="noreferrer" className="btn btn-outline-primary btn-sm" key={doc}>
                    <i className="fa fa-file-pdf me-2" />
                    {doc}
                  </a>
                ))}
              </div>
            </div>}
            <div className="col-12 mt-3">
              <p className="mb-0 text-dark"><strong>Bio:-</strong> {row.bio || "-"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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

const RecentTable = ({ title, rows = [], columns }) => (
  <div className="mt-4">
    <h5>{title}</h5>
    <div className="table-responsive">
      <table className="table table-sm">
        <thead><tr>{columns.map(([key, label]) => <th key={key}>{label}</th>)}</tr></thead>
        <tbody>
          {rows.length ? rows.map((item, i) => (
            <tr key={item.id ?? i}>{columns.map(([key, , fmt]) => <td key={key}>{fmt ? fmt(item) : (item[key] ?? "-")}</td>)}</tr>
          )) : <tr><td colSpan={columns.length} className="text-center text-muted">No records</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
);

const WalletRecent = ({ row, onDeleteTransaction }) => {
  const recent = row.recent || {};
  const date = (item) => formatDisplayDate(item.created_at) || "-";
  return (
    <>
      <RecentTable title="Recent Commissions" rows={recent.commissions} columns={[
        ["id", "ID"], ["level", "Level"],
        ["amount", "Amount", (i) => formatMoney(i.amount ?? i.commission_amount)],
        ["status", "Status"], ["created_at", "Date", date],
      ]} />
      <RecentTable title="Recent Transactions" rows={recent.transactions} columns={[
        ["id", "ID"], ["type", "Type"], ["direction", "Direction"],
        ["amount", "Amount", (i) => formatMoney(i.amount)],
        ["balance_after", "Withdrawable After", (i) => formatMoney(i.balance_after?.withdrawable)],
        ["created_at", "Date", date],
        ["_delete", "Action", (i) => onDeleteTransaction ? (
          <button type="button" className="btn btn-danger shadow btn-xs sharp" title="Delete transaction" onClick={() => onDeleteTransaction(i)}>
            <i className="fa fa-trash" />
          </button>
        ) : "-"],
      ]} />
      <RecentTable title="Recent Withdrawals" rows={recent.withdrawals} columns={[
        ["id", "Withdrawal", (i) => i.withdrawal_no || i.withdrawal_number || i.id],
        ["amount", "Amount", (i) => formatMoney(i.amount)],
        ["method", "Method", (i) => String(i.method || "-").toUpperCase()],
        ["status", "Status"], ["created_at", "Date", date],
      ]} />
    </>
  );
};

export const ModuleView = ({ slug }) => {
  const config = getConfig(slug);
  const [row, setRow] = useState(() => activeRow(slug));
  const [imagePreview, setImagePreview] = useState("");
  const [confirmStatus, setConfirmStatus] = useState(false);
  const [toast, setToast] = useState("");
  const [walletTxnDelete, setWalletTxnDelete] = useState(null); // wallet transaction jise delete karna hai
useEffect(() => {
 if (slug === "quiz-subscription-by-user" || slug === "question-bank") return;
  let active = true;

 const loadDetail = async () => {
    try {
      // ✅ FIX: user-profile/dashboard ke liye moduleApi mein koi entry nahi thi,
      // isliye showModuleFromApi() silently skip ho jaata tha aur GET /users/{id}
      // kabhi call hi nahi hota tha — yahan explicitly real endpoint hit karo.
      if (slug === "user-profile" || slug === "dashboard") {
        if (!row.id) return;
        const response = await apiClient.get(API.USERS_SHOW(row.id), { headers: apiHeaders(), timeout: 12000 });
        const apiRow = response.data?.user || response.data?.data?.user || response.data?.data || response.data;
        if (!active) return;
        const fetchedId = String(apiRow?.id ?? apiRow?.user_id ?? "");
        const currentId = resolveRecordIdentifier(row);
        if (!fetchedId || fetchedId !== currentId) {
          console.warn("Ignoring malformed user response - id mismatch:", { currentId, fetchedId });
          return;
        }
        const mergedRow = { ...row };
        Object.entries(apiRow || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") mergedRow[key] = value;
        });
        const normalized = normalizeUserRow(mergedRow);
        setRow(normalized);
        updateStoredRow(slug, normalized);
        sessionStorage.setItem(activeRecordKey(slug), rowKey(normalized));
        return;
      }

      // Quiz ke liye: header (/quiz-types/{id}) aur questions (/question-ans/{id}) dono ek saath call karo
     if (slug === "quiz") {
        if (!row.id) return;
        const [headerResult, questionsResult] = await Promise.allSettled([
          apiClient.get(API.QUIZ_SHOW(row.id), { headers: apiHeaders(), timeout: 12000 }),
          apiClient.get(API.QUESTION_ANS_ADMIN_INDEX, { headers: apiHeaders(), timeout: 12000 }),
        ]);
        if (!active) return;

        let mergedRow = { ...row };

        if (headerResult.status === "fulfilled") {
          const apiRow = extractSavedRow(headerResult.value.data, "quiz");
          const fetchedId = resolveRecordIdentifier(apiRow);
          const currentId = resolveRecordIdentifier(row);
          if (fetchedId && fetchedId === currentId) {
            Object.entries(apiRow || {}).forEach(([key, value]) => {
              if (value !== undefined && value !== null && value !== "") mergedRow[key] = value;
            });
          } else {
            console.warn("Ignoring malformed header response for quiz - id mismatch:", { currentId, fetchedId });
          }
        }

        if (questionsResult.status === "fulfilled") {
          // /admin-rti/question-ans poori list deta hai — id se lookup nahi hota,
          // is quiz ka group_key match karke hi uske questions nikalte hai.
          const allQuestions = extractRows(questionsResult.value.data);
          const targetGroupKey = mergedRow.groupKey || mergedRow.group_key || row.groupKey;
          const matchedQuestions = targetGroupKey
            ? allQuestions.filter((q) => (q.group_key || q.groupKey) === targetGroupKey)
            : allQuestions.filter((q) => String(q.quiz_type_id ?? q.quizTypeId ?? "") === String(row.id));
          const fetchedQuestions = matchedQuestions.map((q) => ({
             id: q.id,  
            question: q.question || "",
            marks: q.marks || "",
            optionA: q.option?.[0] || "",
            optionB: q.option?.[1] || "",
            optionC: q.option?.[2] || "",
            optionD: q.option?.[3] || "",
            correctAnswer: q.correct_ans || "",
            explanation: q.explation || q.explanation || "",
          }));
          mergedRow.questions = fetchedQuestions;
        }

        setRow(mergedRow);
        updateStoredRow(slug, mergedRow);
        sessionStorage.setItem(activeRecordKey(slug), rowKey(mergedRow));
        return;
      }

      // Wallet detail: row pe click -> GET /wallets/{userId} (summary + recent commissions/transactions/withdrawals)
      if (slug === "wallets") {
        const targetUserId = row.userId ?? row.user_id ?? resolveRecordIdentifier(row);
        if (!targetUserId) return;
        const response = await adminRtiClient.get(API.WALLET_SHOW(encodeURIComponent(targetUserId)), { headers: apiHeaders(), timeout: 12000 });
        console.log(`RAW_WALLET_DETAIL_RESPONSE user_id=${targetUserId}`, response.data); // TEMP
        if (!active) return;
        const d = response.data?.data && !Array.isArray(response.data.data) ? response.data.data : response.data;
        const walletObj = pickWalletObject(response.data) || {};
        const normalized = {
          ...normalizeModuleRow("wallets")({ ...row, ...walletObj, user_id: targetUserId, user: walletObj.user || d?.user || row.user }),
          recent: {
            commissions: toList(d?.recent_commissions ?? d?.commissions),
            transactions: toList(d?.recent_transactions ?? d?.transactions ?? d?.wallet_transactions),
            withdrawals: toList(d?.recent_withdrawals ?? d?.withdrawals),
          },
        };
        setRow(normalized);
        updateStoredRow(slug, normalized);
        sessionStorage.setItem(activeRecordKey(slug), rowKey(normalized));
        return;
      }

      // Profile update request: single user ka pending data GET /users/pending-profiles?user_id={id}
      if (slug === "profile-update-requests") {
        const targetUserId = resolveRecordIdentifier(row);
        if (!targetUserId) return;
        const response = await adminRtiClient.get(API.PROFILE_UPDATE_REQUESTS_INDEX, {
          headers: apiHeaders(),
          params: { user_id: targetUserId },
          timeout: 12000,
        });
        console.log(`RAW_PENDING_PROFILE_RESPONSE user_id=${targetUserId}`, response.data);
        if (!active) return;
        const list = extractRows(response.data);
        const match = list.find((item) => String(item?.user_id ?? item?.userId ?? item?.id) === String(targetUserId))
          || list[0]
          || (response.data?.data && !Array.isArray(response.data.data) ? response.data.data : null);
        if (!match || typeof match !== "object") return;
        const normalized = summarizeProfileUpdateRequest(match);
        setRow(normalized);
        updateStoredRow(slug, normalized);
        sessionStorage.setItem(activeRecordKey(slug), rowKey(normalized));
        return;
      }

      const apiRow = await showModuleFromApi(slug, row);
      if (!active) return;

      const currentId = resolveRecordIdentifier(row);
      const fetchedId = resolveRecordIdentifier(apiRow);
      if (!fetchedId || fetchedId !== currentId) {
        console.warn("Ignoring malformed API response for", slug, "- id mismatch:", { currentId, fetchedId });
        return;
      }

      const mergedRow = { ...row };
      Object.entries(apiRow || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") mergedRow[key] = value;
      });

      setRow(mergedRow);
      updateStoredRow(slug, mergedRow);
      sessionStorage.setItem(activeRecordKey(slug), rowKey(mergedRow));
    } catch (error) {
      if (active) setToast(apiMessage(error, "Unable to load details from server"));
    }
  };

  loadDetail();
  return () => { active = false; };
}, [slug]);

  // Wallet transaction delete: DELETE /api/rti-admin/wallet/{transactionId}
  // Sirf list se hide hota hai, wallet balance NAHI badalta.
  const removeWalletTransactionFromView = (txnId) => {
    const next = {
      ...row,
      recent: {
        ...(row.recent || {}),
        transactions: toList(row.recent?.transactions).filter((item) => String(item.id) !== String(txnId)),
      },
    };
    setRow(next);
    updateStoredRow(slug, next);
  };
  const confirmWalletTransactionDelete = async () => {
    const txn = walletTxnDelete;
    setWalletTxnDelete(null);
    if (!txn?.id) return;
    try {
      await apiClient.delete(API.WALLET_TXN_DELETE(encodeURIComponent(txn.id)), { headers: apiHeaders(), timeout: 12000 });
      removeWalletTransactionFromView(txn.id);
      setToast("Wallet transaction deleted successfully.");
    } catch (error) {
      if (error?.response?.status === 404) {
        removeWalletTransactionFromView(txn.id); // already deleted / galat id -> list se hata do
        setToast("Transaction already deleted or not found.");
        return;
      }
      setToast(apiMessage(error, "Wallet transaction delete failed."));
    }
  };

  return (
    <>
      <AppToast show={Boolean(toast)} message={toast} onClose={() => setToast("")} />
      <ConfirmModal
        show={Boolean(walletTxnDelete)}
        title="Delete Transaction"
        intent="delete"
        message={`Delete wallet transaction #${walletTxnDelete?.id || ""} (${formatMoney(walletTxnDelete?.amount)})? This only hides it from the list — the wallet balance will NOT change.`}
        confirmText="Delete"
        variant="danger"
        onHide={() => setWalletTxnDelete(null)}
        onConfirm={confirmWalletTransactionDelete}
      />
      <div className="d-flex align-items-center gap-3 flex-wrap mb-4">
        <Link to={`/admin/${slug}`} className="btn btn-light">
          <i className="fa fa-arrow-left me-2" />
          Back
        </Link>
        {slug !== "user-profile" && <h3 className="mb-0">{config.title} Details</h3>}
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
            </div>
            <div className="card-body">
              {(row.image || row.profile_image) && slug !== "profile-update-requests" && (
                <button type="button" className="rti-image-button mb-3" onClick={() => setImagePreview(row.image || row.profile_image || profile)}>
                  <img src={row.image || row.profile_image || profile} alt={pickRecordTitle(row)} className="rti-detail-image" />
                </button>
              )}
              <DetailGrid fields={config.details} row={row} onStatus={() => setConfirmStatus(true)} slug={slug} />
              {slug === "wallets" && <WalletRecent row={row} onDeleteTransaction={setWalletTxnDelete} />}
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
        onConfirm={async () => {
          const nextStatus = nextStatusForSlug(slug, row.status || "Active");
          logStatusChange(row, nextStatus);
          try {
            if (slug === "user-profile" || slug === "dashboard") {
              await updateUserStatusInApi(row, nextStatus);
            } else if (MODULE_API_SLUGS.includes(slug)) {
              await updateModuleStatusInApi(slug, row, nextStatus);
            }
            setRow((current) => {
              const updated = { ...current, status: nextStatus };
              updateStoredRow(slug, updated);
              sessionStorage.setItem(activeRecordKey(slug), rowKey(updated));
              return updated;
            });
            setConfirmStatus(false);
            setToast(`${pickRecordTitle(row)} status updated successfully`);
          } catch (error) {
            setConfirmStatus(false);
            setToast(apiMessage(error, "Status update failed. Please check server response."));
          }
        }}
      />
      <ImageModal image={imagePreview} onHide={() => setImagePreview("")} />
    </>
  );
};

const Field = ({ label, name, type = "text", as = "input", options, multiple = false, required = true, readOnly = false, accept, value = "", allowCustom = false, onValueChange, disabled = false, placeholder }) => {
  const initialSelected = multiple
    ? String(value || "").split(",").map((item) => item.trim()).filter(Boolean).map(selectOption)
    : value ? selectOption(value) : null;
  const [selected, setSelected] = useState(initialSelected);
  const [textValue, setTextValue] = useState((type === "date" || type === "datetime-local") ? toDateInputValue(value) : value || "");
  const inputType = type;
  const hiddenValue = multiple ? selected.map((option) => option.value).join(", ") : selected?.value || "";

  useEffect(() => {
    const nextSelected = multiple
      ? String(value || "").split(",").map((item) => item.trim()).filter(Boolean).map(selectOption)
      : value ? selectOption(value) : null;
    setSelected(nextSelected);
  }, [multiple, value]);

  useEffect(() => {
    const nextTextValue = type === "date" || type === "datetime-local" ? toDateInputValue(value) : value || "";
    setTextValue(nextTextValue);
  }, [type, value]);

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
             autoComplete={type === "password" ? "new-password" : type === "email" ? "off" : "off"}
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
  if (type !== "file") {
    setTextValue(event.currentTarget.value);
    onValueChange?.(event.currentTarget.value);
  }
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
  const generatedId = buildSequentialId(slug, getRows(slug));
  const questionNumbers = Array.from(form.querySelectorAll("[data-question-number]")).map((node) => node.dataset.questionNumber);
  const questions = questionNumbers.map((item) => ({
    id: data[`question-id-${item}`] || undefined,
    question: data[`question-${item}`] || "",
    marks: data[`marks-${item}`] || "",
    optionA: data[`option-a-${item}`] || "",
    optionB: data[`option-b-${item}`] || "",
    optionC: data[`option-c-${item}`] || "",
    optionD: data[`option-d-${item}`] || "",
    correctAnswer: data[`correct-${item}`] || "",
    explanation: data[`explanation-${item}`] || "",
  })).filter((question) => question.question);
  const firstName = data.firstname || data["full-name"] || data.name || "";
  const lastName = data.lastname || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const profileImage = data.imageUrl || existing.profile_image || existing.image || data.image || "";
 
  return {
    ...existing,
    _local: true,
    _rowKey: rowKey(existing) || generatedId,
      _createdAtRaw: existing._createdAtRaw || new Date().toISOString(),   
    sr: existing.sr || Date.now(),
    id: slug === "user-profile" ? (data["user-id"] || existing.id || generatedId) : (data.id || data["news-id"] || data["epaper-id"] || data["ad-id"] || data["office-id"] || existing.id || generatedId),
    adId: data["ad-id"] || existing.adId || "",
    user_id: data.user_id || existing.user_id || "",
    userId: slug === "user-profile" ? (data["user-id"] || existing.userId || generatedId) : (data["user-id"] || existing.userId || ""),
    profileId: slug === "user-profile" ? (data["user-id"] || existing.profileId || generatedId) : (data["user-id"] || existing.profileId || ""),
    transactionId: data["transaction-id"] || existing.transactionId || generatedId,
    orderId: data["order-id"] || "",
    firstname: firstName,
    lastname: lastName,
    name: fullName || firstName || "New Record",
    username: fullName || firstName || "New Record",
    title: data.title || fullName || firstName || "New Record",
    author: data.author || "",
    email: data.email || "",
    phone: data.phone || data["mobile-number"] || "",
    mobileNumber: data["mobile-number"] || data.phone || "",
    password: data.password || "",
    profile_image: profileImage || "",
    image: profileImage || data["media-fileUrl"] || existing.image || (["user", "ad"].includes(config.form) ? profile : undefined),
    state: data.state || "",
    district: data.district || "",
      taluka: data.taluka || "",
    village: data.village || existing.village || "",
    role: data.role || "",
    category: data.category || "",
    sub_id: data.sub_id || existing.sub_id || "",
    subscription_id: data.subscription_id || existing.subscription_id || "",
    subscription_name: data.subscription_name || existing.subscription_name || "",
    subject: data.subject || "",
    subjects: data.subjects || existing.subjects || "",
    difficulty: data.difficulty || "",
    testType: data["test-types"] || "",
    product: data["product-name"] || "",
    productName: data["product-name"] || data.title || "",
    sellerName: data["seller-name"] || existing.sellerName || fullName || data.name || "",
    title: data.title || data["product-name"] || fullName || firstName || "New Record",
    officeName: data["office-name"] || "",
    location: data.location || data.city || "",
    contact: data.contact || data.phone || data["mobile-number"] || "",
    quantity: data.quantity || "",
    price: data.price || existing.price || "",
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
    price: data.price || existing.price || "",
    credits: data.credits || existing.credits || "",
    total_credit: data.total_credit || data.total_credits || data.credits || existing.total_credit || "",
    total_credits: data.total_credits || data.total_credit || data.credits || existing.total_credits || "",
    creditsUsed: data["credits-used"] || existing.creditsUsed || "",
    creditsLeft: data["credits-left"] || existing.creditsLeft || "",
    days: data.days || existing.days || "",
    attempts: data.attempts || existing.attempts || "",
    attempts_used: data.attempts_used || existing.attempts_used || "",
    attempts_left: data.attempts_left || existing.attempts_left || "",
    quiz_count: data["quiz-count"] || existing.quiz_count || "",
    offerPrice: data["offer-price"] || data.offer_price || existing.offerPrice || existing.offer_price || "",
    offer_price: data["offer-price"] || data.offer_price || existing.offer_price || existing.offerPrice || "",
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
    timeLimit: data["time-limit"] || existing.timeLimit || "",
adsSubId: data["ads-sub-id"] || existing.adsSubId || "",
redirection: data["redirection"] || existing.redirection || "",
redirectionUrl: data["redirection-url"] || existing.redirectionUrl || "",
ecomSubId: data["ecom-sub-id"] || existing.ecomSubId || "",
quizTypeId: data["quiz-type-id"] ? String(data["quiz-type-id"]).split("—")[0].trim() : existing.quizTypeId || "",
groupKey: data["group-key"] || existing.groupKey || "",
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

   // ✅ FIX: User registration me state/district/taluka teeno zaroori hain (waisa hi rakha)
  if (slug === "user-profile") {
    if (!form.elements.state?.value || !form.elements.district?.value || !form.elements.taluka?.value) {
      swal("Location Required", "Please select state, district and taluka in order.", "error");
      return false;
    }
  }

  // ✅ FIX: Subscription plan me state/district/taluka OPTIONAL hain —
  // khaali chhodne ka matlab "sabhi jagah ke liye" (all states / all districts / all talukas).
  // Bas hierarchy sahi honi chahiye: state ke bina district nahi, district ke bina taluka nahi.
  if (slug === "subscription-plan") {
    const stateVal = form.elements.state?.value || "";
    const districtVal = form.elements.district?.value || "";
    const talukaVal = form.elements.taluka?.value || "";

    if (districtVal && !stateVal) {
      swal("Select State First", "District select karne se pehle State choose karein, ya District bhi khaali chhod dein.", "error");
      return false;
    }
    if (talukaVal && !districtVal) {
      swal("Select District First", "Taluka select karne se pehle District choose karein, ya Taluka bhi khaali chhod dein.", "error");
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
  // ["User ID", "user-id", "text"],   
    ["First Name", "firstname"],
    ["Last Name", "lastname"],
    ["Email Address", "email", "email"],
    ["Password", "password", "password"],
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
    // ["News ID", "news-id"],
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
  ["Role", "role", "select", subscriptionRoleOptions],
  ["State ", "state", "select", stateOptions],
  ["District", "district", "select", defaultDistricts],
   ["Taluka", "taluka", "select", defaultTalukas],
  ["Village", "village"],
  ["Price", "price", "number"],
  ["Offer Price", "offer-price", "number"],   
  ["Credits", "credits", "number"],           
  ["Days", "days", "number"],                 
  ["Description", "description", "textarea"],
  ["Status", "status", "select", ["Active", "Inactive"]],
],
  commerceSubscription: [
    // ["Sub ID", "sub_id", "number"],
    ["Subscription Title", "title"],
    ["Description", "description", "textarea"],
    ["Credits", "credits", "number"],
    ["Days", "days", "number"],
    ["Price", "price", "number"],
    ["Offer Price", "offer-price", "number"],
    ["Status", "status", "select", ["Active", "Inactive"]],
  ],

  questionBank: [
  ["Quiz Type", "quiz-type-id", "select", []],
  ["Group Key (blank chhodo to auto-generate hoga)", "group-key"],
  ["Status", "status", "select", ["Active", "Inactive"]],
],

  ecomSell: [
  ["Ecom Subscription ID", "ecom-sub-id"],
  ["Category", "category"],
  ["Product Title", "title"],
  ["Quantity", "quantity", "number"],
  ["Price", "price", "number"],
  ["City", "city"],
  ["Contact Number", "contact", "tel"],
  ["Start Date", "start-date", "date"],
  ["End Date", "end-date", "date"],
  ["Images", "images", "file"],
  ["Description", "description", "textarea"],
  ["Status", "status", "select", ["Active", "Inactive"]],
],
//  ecomSell: [
//   ["Ecom Subscription ID", "ecom-sub-id"],
//   ["Category", "category"],
//   ["Product Title", "title"],
//   ["Quantity", "quantity", "number"],
//   ["Price", "price", "number"],
//   ["City", "city"],
//   ["Contact Number", "contact", "tel"],
//   ["Start Date", "start-date", "date"],
//   ["End Date", "end-date", "date"],
//   ["Images", "images", "file"],
//   ["Description", "description", "textarea"],
//   ["Status", "status", "select", ["Active", "Inactive"]],
// ],
  epaper: [
    // ["E-Paper ID", "epaper-id"],
    ["Title", "title"],
    ["PDF Files", "pdf-files", "file"],
    ["Publish Date", "publish-date", "date"],
    ["Total Page", "total-page", "number"],
  ],
  ad: [
    // ["ID", "ad-id"],
    ["Status", "status", "select", ["Active", "Inactive"]],
    ["Product Name", "product-name"],
    ["Media File", "media-file", "file"],
    ["Product Price", "price", "number"],
    ["Offer Price", "offer-price", "number"],
    ["Start Date & Time", "start-date-time", "datetime-local"],
    ["End Date & Time", "end-date-time", "datetime-local"],
    ["Description", "description", "textarea"],
  ],
  
   adsSubscription: [
  ["Subscription Title", "title"],
  ["Description", "description", "textarea"],
  ["Price", "price", "number"],
  ["Offer Price", "offer-price", "number"],
  ["Credits", "credits", "number"],
  ["Days", "days", "number"],
  ["Status", "status", "select", ["Active", "Inactive"]],
],

adsManagement: [
  ["Ads Title", "title"],
  ["Ads Subscription", "ads-sub-id", "select", []], // options ads-subscription list se dynamically fill karo
  ["Start Date", "start-date", "date"],
  ["End Date", "end-date", "date"],
  ["Redirection", "redirection", "select", ["Yes", "No"]],
  ["Redirection URL", "redirection-url", "url"],
  ["Media File", "media-file", "file"],
  ["Description", "description", "textarea"],
  ["Status", "status", "select", ["Active", "Inactive"]],
],
  office: [
    // ["Office ID", "office-id"],
    ["Office Name", "office-name"],
    ["Address", "address", "textarea"],
    ["Phone", "phone", "tel"],
    ["Email", "email", "email"],
    ["Map Link (Optional)", "map-link", "url"],
  ],
  notification: [
    // ["ID", "id"],
    ["Title", "title"],
    ["Message", "message", "textarea"],
    ["User Type", "user-type", "select", ["All Users", "Premium Users", "Inactive Users"]],
    ["Sent By", "sent-by"],
    ["Sent At", "sent-at", "datetime-local"],
    ["Created At", "created-at", "datetime-local"],
    ["Updated At", "updated-at", "datetime-local"],
  ],

  quizSubscriptionCreate: [
  ["Title", "title"],
  ["Description", "description", "textarea"],
  ["Quiz Count", "quiz-count", "number"],
  ["Days", "days", "number"],
  ["Price", "price", "number"],
  ["Offer Price", "offer-price", "number"],
  ["Status", "status", "select", ["Active", "Inactive"]],
],
  
  quizSubscriptionByUser: [
  ["ID", "id"],
  ["User ID", "user_id"],
  ["Subscription ID", "subscription_id"],
  ["Subscription Name", "subscription_name"],
  ["Subject", "subject", "select", ["RTI", "BNS", "Journalism", "Constitution", "Legal Studies"]],
  ["Price", "price", "number"],
  ["Attempts Used", "attempts_used", "number"],
  ["Attempts Left", "attempts_left", "number"],
  ["Status", "status", "select", ["Active", "Inactive"]],
  ["Start Date", "startDate", "date"],
  ["End Date", "endDate", "date"],
],
};
const QuizQuestions = ({ currentRow = {} }) => {
  const existingQuestions = currentRow.questions?.length ? currentRow.questions : [];
  const [questions, setQuestions] = useState(existingQuestions.length ? existingQuestions.map((_, index) => index + 1) : [1]);
  const [marksMap, setMarksMap] = useState(() => {
    const initial = {};
    (existingQuestions.length ? existingQuestions.map((_, index) => index + 1) : [1]).forEach((item, index) => {
      initial[item] = Number(existingQuestions[index]?.marks || 0);
    });
    return initial;
  });

  useEffect(() => {
    if (existingQuestions.length) {
      setQuestions(existingQuestions.map((_, index) => index + 1));
      const nextMarks = {};
      existingQuestions.forEach((q, index) => {
        nextMarks[index + 1] = Number(q.marks || 0);
      });
      setMarksMap(nextMarks);
    }
  }, [existingQuestions.length]);

  const totalMarks = Object.values(marksMap).reduce((sum, value) => sum + (Number(value) || 0), 0);

  const addQuestion = () => {
    setQuestions((items) => {
      const nextNumber = Math.max(...items, 0) + 1;
      setMarksMap((map) => ({ ...map, [nextNumber]: 0 }));
      return [...items, nextNumber];
    });
  };

  const removeQuestion = (item) => {
    setQuestions((items) => items.filter((question) => question !== item));
    setMarksMap((map) => {
      const nextMap = { ...map };
      delete nextMap[item];
      return nextMap;
    });
  };

  return (
    <>
      <div className="mb-3 d-flex align-items-center justify-content-between">
        <button type="button" className="btn btn-outline-primary btn-sm" onClick={addQuestion}>
          <i className="fa fa-plus me-1" />
          Add Question
        </button>
        <strong>Total Marks: {totalMarks}</strong>
      </div>
      {questions.map((item) => (
        <div className="rti-question-editor" key={item} data-question-number={item}>
          <div className="d-flex align-items-center justify-content-between">
            <h5 className="rti-question-title"><span>Question</span><strong>{item}</strong></h5>
            <button type="button" className="btn btn-danger btn-xs" onClick={() => removeQuestion(item)}>
              <i className="fa fa-trash" />
            </button>
          </div>
          {/* 👇 NAYA — existing question ka id form submit tak carry karne ke liye */}
          <input type="hidden" name={`question-id-${item}`} value={existingQuestions[item - 1]?.id || ""} />
          <Field label="Question" name={`question-${item}`} as="textarea" value={existingQuestions[item - 1]?.question || ""} />
          <Field
            label="Marks"
            name={`marks-${item}`}
            type="number"
            value={existingQuestions[item - 1]?.marks || ""}
            onValueChange={(value) => setMarksMap((map) => ({ ...map, [item]: Number(value) || 0 }))}
          />
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
 const fields = (formFields[config.form] || []).flatMap((f) => (config.form === "user" && f[1] === "taluka" ? [f, ["Village", "village"]] : [f]));
  const isQuiz = config.form === "quiz";
  const isQuestionBank = config.form === "questionBank";
  const currentRow = mode === "Update" ? activeRow(slug) : {};

  const [quizTypeOptions, setQuizTypeOptions] = useState([]);
  useEffect(() => {
    if (!isQuestionBank) return;
    let active = true;
    apiClient.get(API.QUIZ_INDEX, { headers: apiHeaders(), timeout: 12000 })
      .then((res) => {
        if (!active) return;
        const quizRows = extractRows(res.data);
        setQuizTypeOptions(quizRows.map((q) => `${q.id} — ${q.title || "Quiz " + q.id}`));
      })
      .catch(() => {});
    return () => { active = false; };
  }, [isQuestionBank]);
   const [locationState, setLocationState] = useState({
    state: currentRow.state || "",
    district: currentRow.district || "",
    taluka: currentRow.taluka || "",
    village: currentRow.village || "",
  });

  const [resolvedRow, setResolvedRow] = useState(currentRow);
const [loadingQuestions, setLoadingQuestions] = useState(
  slug === "quiz" &&
  mode === "Update" &&
  !(currentRow.questions?.length && currentRow.questions.every((q) => q.id))
);

useEffect(() => {
  const hasQuestionsWithIds =
    currentRow.questions?.length && currentRow.questions.every((q) => q.id);
  if (slug !== "quiz" || mode !== "Update" || !currentRow.id || hasQuestionsWithIds) return;

  let active = true;
  apiClient.get(API.QUESTION_ANS_ADMIN_INDEX, { headers: apiHeaders(), timeout: 12000 })
    .then((res) => {
      if (!active) return;
      const allQuestions = extractRows(res.data);
      const targetGroupKey = currentRow.groupKey || currentRow.group_key;
      const matchedQuestions = targetGroupKey
        ? allQuestions.filter((q) => (q.group_key || q.groupKey) === targetGroupKey)
        : allQuestions.filter((q) => String(q.quiz_type_id ?? q.quizTypeId ?? "") === String(currentRow.id));
      const fetchedQuestions = matchedQuestions.map((q) => ({
        id: q.id,
        question: q.question || "",
        marks: q.marks || "",
        optionA: q.option?.[0] || "",
        optionB: q.option?.[1] || "",
        optionC: q.option?.[2] || "",
        optionD: q.option?.[3] || "",
        correctAnswer: q.correct_ans || "",
        explanation: q.explation || q.explanation || "",
      }));
      const updated = { ...currentRow, questions: fetchedQuestions };
      setResolvedRow(updated);
      updateStoredRow(slug, updated);
    })
    .finally(() => { if (active) setLoadingQuestions(false); });
  return () => { active = false; };
}, [slug, mode, currentRow.id]);


   useEffect(() => {
    setLocationState({
      state: currentRow.state || "",
      district: currentRow.district || "",
      taluka: currentRow.taluka || "",
      village: currentRow.village || "",
    });
  }, [currentRow.state, currentRow.district, currentRow.taluka, currentRow.village]);

  // ✅ NAYA — Role list location ke hisaab se badlegi:
  // kuch bhi nahi -> National, State -> State roles, State+District -> District roles,
  // State+District+Taluka -> Taluka roles, sab 4 bhare -> Village roles. Premium hamesha last me.
  const roleOptionsForLocation = useMemo(() => {
    if (config.form !== "subscription") return subscriptionRoleOptions;
    const { state, district, taluka, village } = locationState;
    const { localizedRoles } = getRoleOptionsForLocation(state, district, taluka, village);
    return [...localizedRoles, OPEN_ROLE_LABEL];
  }, [config.form, locationState]);

  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);
  const allFields = useMemo(() => {
  if (!isQuiz) return fields;
  return [
    ["Title", "title"],
    ["Subject", "subject", "select", ["RTI", "BNS", "Journalism"]],
    ["Difficulty", "difficulty", "select", ["Easy", "Medium", "Hard"]],
    ["Status", "status", "select", ["Active", "Inactive"]],
    ["Test Types", "test-types", "select", ["Practice (20 Q)", "Training (50 Q)", "Exam (100 Q)"]],
    ["Time Limit (Minutes)", "time-limit", "number"],
  ];
}, [fields, isQuiz]);

  const submitLabel =
    mode === "Add"
      ? slug === "news" ? "Create News"
        : slug === "subscription-plan" ? "Create Subscription"
          : ["ecommerce-subscription", "ads-subscription"].includes(slug) ? "Create Plan"
            : slug === "quiz" ? "Submit All Questions"
              : `Create ${config.title}`
      : slug === "subscription-plan" ? "Create Subscription" : `Update ${config.title}`;

  const nextRecordId = useMemo(() => {
    if (mode !== "Add") return "";
    return buildSequentialId(slug, getRows(slug));
  }, [mode, slug]);

  const fieldValue = (name) => {
    const map = {
      "user-id": mode === "Add" && slug === "user-profile" ? nextRecordId : currentRow.userId,
      "news-id": mode === "Add" && slug === "news" ? nextRecordId : currentRow.id,
      firstname: currentRow.firstname || currentRow.name || "",
      lastname: currentRow.lastname || "",
      "full-name": currentRow.name || currentRow.firstname || "",
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
      "quiz-count": currentRow.quiz_count,
      "ad-id": currentRow.adId || currentRow.id,
      "product-name": currentRow.productName || currentRow.product,
      "offer-price": currentRow.offerPrice,
      "credits-used": currentRow.creditsUsed,
      "credits-left": currentRow.creditsLeft,
      days: currentRow.days,
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
      "time-limit": currentRow.timeLimit,
      "ads-sub-id": currentRow.adsSubId || currentRow.ads_sub_id,
"redirection": currentRow.redirection,
"redirection-url": currentRow.redirectionUrl || currentRow.redirection_url,

"quiz-type-id": currentRow.quizTypeId,
"group-key": currentRow.groupKey,
    };
    return map[name] ?? currentRow[name] ?? "";
  };

  const renderField = ([label, name, type, options]) => {
    if (config.form === "subscription" && name === "role") {
      return <Field key={name} label={label} name={name} as="select" options={roleOptionsForLocation} value={fieldValue(name)} required={false} />;
    }
     if (isQuestionBank && name === "quiz-type-id") {
      const currentLabel = quizTypeOptions.find((opt) => opt.startsWith(`${fieldValue(name)} —`)) || (fieldValue(name) ? String(fieldValue(name)) : "");
      return <Field key={name} label={label} name={name} as="select" options={quizTypeOptions} value={currentLabel} />;
    }
     if (["subscription", "user"].includes(config.form) && ["state", "district", "taluka"].includes(name)) {
      const dynamicOptions = name === "state"
        ? stateOptions
        : name === "district"
          ? getDistrictOptions(locationState.state)
          : getTalukaOptions(locationState.district);
      // ✅ FIX: user-registration me location zaroori hai, subscription-plan me optional
      const isLocationRequired = config.form === "user";
      return (
        <Field
          key={`${name}-${locationState[name]}`}
          label={label}
          name={name}
          as="select"
          options={dynamicOptions}
          value={locationState[name]}
          required={isLocationRequired}
          disabled={(name === "district" && !locationState.state) || (name === "taluka" && !locationState.district)}
                onValueChange={(value) => setLocationState((current) => ({
            ...current,
            [name]: value,
...(name === "state" ? { district: "", taluka: "", village: "" } : {}),
            ...(name === "district" ? { taluka: "", village: "" } : {}),
            ...(name === "taluka" ? { village: "" } : {}),
          }))}
        />
      );
    }
   if (["subscription", "user"].includes(config.form) && name === "village") {
      return (
        <Field
          key={name}
          label={label}
          name={name}
          value={locationState.village}
          required={false}
          onValueChange={(value) => setLocationState((current) => ({ ...current, village: value }))}
        />
      );
    }
    if (type === "select") return <Field key={name} label={label} name={name} as="select" options={options} value={fieldValue(name)} />;
    if (type === "select-multiple") return <Field key={name} label={label} name={name} as="select" options={options} multiple value={fieldValue(name)} />;
    if (type === "textarea") return <Field key={name} label={label} name={name} as="textarea" value={fieldValue(name)} />;
    if (type === "file") return <FileUpload key={name} label={label} currentName={fieldValue(name)} currentUrl={name === "media-file" ? currentRow.mediaFileUrl : name === "pdf-files" ? currentRow.pdfFilesUrl : ""} />;
   return <Field key={name} label={label} name={name} type={type || "text"} value={fieldValue(name)} required={name === "password" ? mode !== "Update" : name === "village" ? false : true}  placeholder={name === "days" ? "Enter days" : undefined}/>;
  };

  return (
    <>
      <AppToast show={Boolean(toast)} variant="error" message={toast} onClose={() => setToast("")} />
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
          <form className="form-valide" autoComplete="off" onSubmit={async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            if (!validateModuleForm(slug, form)) return;
            setSaving(true);
            try {
              const localRecord = await makeRecordFromForm(slug, config, form, currentRow);
      let record;     
// if (slug === "user-profile" || slug === "dashboard") {
//   record = await saveUserToApi(localRecord, mode, currentRow);
// } else if (slug === "question-bank") {
//   record = await saveQuestionBankToApi(localRecord, mode, currentRow);
// } else if (slug === "quiz") {                                   // 👈 NAYA
//   record = await saveQuizToApi(localRecord, mode, currentRow);   // 👈 NAYA
// } else if (MODULE_API_SLUGS.includes(slug)) {
//   record = await saveModuleToApi(slug, localRecord, mode, currentRow, form);
// } else {
//   record = localRecord;

// }
if (slug === "user-profile" || slug === "dashboard") {
  record = await saveUserToApi(localRecord, mode, currentRow);
} else if (slug === "question-bank") {
  record = await saveQuestionBankToApi(localRecord, mode, currentRow);
} else if (slug === "quiz") {
  record = await saveQuizToApi(localRecord, mode, currentRow);
} else if (slug === "quiz-subscription-create") {          // 👈 NAYA
  record = await saveQuizSubscriptionPlanToApi(localRecord, mode, currentRow);
} else if (MODULE_API_SLUGS.includes(slug)) {
  record = await saveModuleToApi(slug, localRecord, mode, currentRow, form);
} else {
  record = localRecord;
}
             const currentRows = getRows(slug);
const currentKey = rowKey(currentRow);
const nextRows = mode === "Add"
  ? (slug === "subscription-plan" ? [record] : [record, ...currentRows]) 
 
  : currentRows.some((item) => rowKey(item) === currentKey)
    ? currentRows.map((item) => rowKey(item) === currentKey ? record : item)
    : [record, ...currentRows];
saveStoredRows(slug, nextRows);
              sessionStorage.setItem(activeRecordKey(slug), rowKey(record));
              setToast("");
              sessionStorage.setItem("moduleToast", `${pickRecordTitle(record)} ${mode === "Add" ? "added" : "updated"} successfully`);
              navigate(`/admin/${slug}`);
            } catch (error) {
              setToast(apiMessage(error, `${mode} failed. Please check server response.`));
            } finally {
              setSaving(false);
            }
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
                    <Field label="Biography" name="bio" as="textarea" value={currentRow.bio || ""} />
                  </>
                )}
              </div>
            </div>
         {(isQuiz || isQuestionBank) && <QuizQuestions currentRow={isQuiz ? resolvedRow : currentRow} />}
            <div className="form-group mb-3 row">
              <div className="col-lg-8 ms-auto">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving && <span className="spinner-border spinner-border-sm me-2" />}
                  {submitLabel}
                </button>
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
      <section className="delete-modal card rti-glass-status-shell">
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
  const canRestore = isRestorableQuizRow(slug, row);
  const [toast, setToast] = useState("");
  const [deleting, setDeleting] = useState(false);

  return (
    <>
      <AppToast show={Boolean(toast)} variant="error" message={toast} onClose={() => setToast("")} />
      <ModalShell slug={slug}>
        <img src={row.image || profile} alt={row.name || row.title} />
        <h3>{canRestore ? "Restore Confirmation" : "Delete Confirmation"}</h3>
        <p>{row.name || row.username || row.title || row.officeName || row.id}</p>
        <p>{row.email || "admin@example.com"}</p>
        <p>{row.phone || "9876543210"}</p>
        <button
          type="button"
          className={`btn ${canRestore ? "btn-success" : "btn-danger"}`}
          disabled={deleting}
          onClick={async () => {
            setDeleting(true);
            try {
           if (slug === "quiz-subscription-create") {
  if (canRestore) {
    await restoreQuizSubscriptionPlanFromApi(row);
  } else {
    await deleteQuizSubscriptionPlanFromApi(row);
  }
  const deletedKey = rowKey(row);
  if (canRestore) {
    saveDeletedKeys(slug, getDeletedKeys(slug).filter((key) => key !== deletedKey));
    updateStoredRow(slug, { ...row, is_deleted: 0, status: row.status || "Active" });
  } else {
    const nextRows = getRows(slug).filter((item) => rowKey(item) !== deletedKey);
    saveStoredRows(slug, nextRows);
    saveDeletedKeys(slug, Array.from(new Set([...getDeletedKeys(slug), deletedKey])));
  }
  sessionStorage.setItem("moduleToast", `${pickRecordTitle(row)} ${canRestore ? "restored" : "deleted"} successfully`);
  navigate(`/admin/${slug}`);
  setDeleting(false);
  return;
}
      
              if (canRestore) {
                const remainingDeletedKeys = getDeletedKeys(slug).filter((key) => key !== rowKey(row));
                saveDeletedKeys(slug, remainingDeletedKeys);
                updateStoredRow(slug, { ...row, deleted_at: "", deletedAt: "", trashed: false, is_deleted: false, status: row.status || "Active" });
              } else {
                const deletedKey = rowKey(row);
                const nextRows = getRows(slug).filter((item) => rowKey(item) !== deletedKey);
                saveStoredRows(slug, nextRows);
                saveDeletedKeys(slug, Array.from(new Set([...getDeletedKeys(slug), deletedKey])));
              }
              sessionStorage.setItem("moduleToast", `${pickRecordTitle(row)} ${canRestore ? "restored" : "deleted"} successfully`);
              navigate(`/admin/${slug}`);
            } catch (error) {
              setToast(apiMessage(error, `${canRestore ? "Restore" : "Delete"} failed. Please check server response.`));
            } finally {
              setDeleting(false);
            }
          }}
        >
          {deleting && <span className="spinner-border spinner-border-sm me-2" />}
          {canRestore ? "Restore" : "Delete"}
        </button>
      </ModalShell>
    </>
  );
};

export const ModuleStatus = ({ slug }) => {
  const row = activeRow(slug);
  const [active, setActive] = useState((row.status || "Active") === "Active");
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <AppToast show={Boolean(toast)} variant="error" message={toast} onClose={() => setToast("")} />
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
            disabled={saving}
            onChange={() => setActive((value) => !value)}
            id="statusSwitch"
          />
          <label className="form-check-label" htmlFor="statusSwitch">
            {active ? "Active" : "Inactive"}
          </label>
        </div>
        <button
          type="button"
          className="btn btn-primary mt-2"
          disabled={saving}
          onClick={async () => {
            const nextStatus = active ? "Active" : "Inactive";
            setSaving(true);
                   try {
              if (slug === "user-profile" || slug === "dashboard") {
                await updateUserStatusInApi(row, nextStatus);
              } else if (slug === "quiz-subscription-create") {
                await updateQuizSubscriptionPlanStatusInApi(row, nextStatus);
              } else if (MODULE_API_SLUGS.includes(slug)) {
                await updateModuleStatusInApi(slug, row, nextStatus);
              }
              updateStoredRow(slug, { ...row, status: nextStatus });
              sessionStorage.setItem("moduleToast", `${pickRecordTitle(row)} status updated successfully`);
              navigate(`/admin/${slug}`);
            } catch (error) {
              setToast(apiMessage(error, "Status update failed. Please check server response."));
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving && <span className="spinner-border spinner-border-sm me-2" />}
          Done
        </button>
      </ModalShell>
    </>
  );
};

export const ModuleDeleted = ModuleDelete;