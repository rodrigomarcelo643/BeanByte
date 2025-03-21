import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import { useNavigate, useLocation } from "react-router-dom";
import { firestore } from "../../config/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import {
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  PresentationChartBarIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  InboxIcon,
  PowerIcon,
  BellIcon,
} from "@heroicons/react/24/solid";
import logo from "../assets/main_logo.png";
import profile from "../assets/default_picture.jpg";
import dashboardIcon from "../assets/dashboardIcon.png";
import manageLogo from "../assets/manageProducts.png";
import transactionsLogo from "../assets/transactionsLogo.png";
import ordersIcon from "../assets/ordersIcon.png";
import logoutIcon from "../assets/logoutIcon.png";
import Analytics from "../pages/Analytics";
import Reporting from "../pages/Reporting";
import Orders from "../pages/Orders";
import Products from "../pages/Products";
import ViewProducts from "../pages/ViewProducts";
import Profile from "../pages/Profile";
import Payments from "../pages/Payments";
import PaymentHistory from "../pages/PaymentHistory";
import AddOrder from "../pages/AddOrder";
import coffeeGif from "../assets/coffee.gif";

const LoadingModal = () => (
  <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] flex justify-center items-center z-999">
    <div className="bg-white rounded-lg flex flex-col justify-center items-center">
      <img src={coffeeGif} className="w-60 h-60" />
      <p className="mt-4 text-[#724E2C] text-xl relative top-[-80px] font-semibold">
        Bean&Co....
      </p>
    </div>
  </div>
);

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = location.state?.userData;
  console.log("Sidebar", userData);
  const [open, setOpen] = useState(0);
  const [activeContent, setActiveContent] = useState(<Analytics />);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastClickedContent, setLastClickedContent] = useState(<Analytics />);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const limit = 10; // Set limit for displaying notifications
  useEffect(() => {
    // If there's no userData to begin with, return early
    if (!userData?.uid) return;

    // Set up a real-time listener on the user's data in the Firebase Realtime Database
    const userRef = ref(database, "users/" + userData.uid);

    // Listen for changes to the user data
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        // Update the state with the new user data
        const updatedUserData = snapshot.val();
        setUserData(updatedUserData); // Update state with new data
      }
    });

    // Clean up listener when the component unmounts or when `userData` changes
    return () => unsubscribe();
  }, [userData?.uid]);
  // Firebase query for unread notifications
  useEffect(() => {
    const q = query(
      collection(firestore, "notifications"),
      where("status", "in", ["unread", "read"])
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      notificationsData.sort(
        (a, b) => b.timestamp.seconds - a.timestamp.seconds
      );

      setNotifications(notificationsData);
      setUnreadCount(
        notificationsData.filter((n) => n.status === "unread").length
      );
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Firebase query for products and stock notifications
  useEffect(() => {
    const q = query(collection(firestore, "products"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const newNotifications = productsData.flatMap((product) => {
        const stock = parseInt(product.stock, 10);
        const notifications = [];

        if (stock === 0) {
          notifications.push({
            id: product.id,
            message: `${product.productName} is out of stock!`,
            status: "unread",
            timestamp: new Date(),
          });
        } else if (stock <= 1) {
          notifications.push({
            id: product.id,
            message: `${product.productName} has only 1 left in stock!`,
            status: "unread",
            timestamp: new Date(),
          });
        } else if (stock <= 5) {
          notifications.push({
            id: product.id,
            message: `${product.productName} has only ${stock} left in stock!`,
            status: "unread",
            timestamp: new Date(),
          });
        } else if (stock <= 10) {
          notifications.push({
            id: product.id,
            message: `${product.productName} has only ${stock} left in stock!`,
            status: "unread",
            timestamp: new Date(),
          });
        }

        return notifications;
      });

      // Combine new notifications with existing ones and remove duplicates
      const combinedNotifications = [...newNotifications, ...notifications];
      const uniqueNotifications = Array.from(
        new Map(combinedNotifications.map((item) => [item.id, item])).values()
      );

      setNotifications(uniqueNotifications);
      setUnreadCount((prevCount) => prevCount + newNotifications.length);
    });

    return () => unsubscribe();
  }, []);

  const updateContent = (content) => {
    if (content === "Analytics") {
      setActiveContent(<Analytics />);
      setLastClickedContent(<Analytics />);
    }
    if (content === "Reporting") {
      setActiveContent(<Reporting />);
      setLastClickedContent(<Reporting />);
    }
    if (content === "Orders") {
      setActiveContent(<Orders />);
      setLastClickedContent(<Orders />);
    }
    if (content === "Payments") {
      setActiveContent(<Payments />);
      setLastClickedContent(<Payments />);
    }
    if (content === "PaymentHistory") {
      setActiveContent(<PaymentHistory />);
      setLastClickedContent(<PaymentHistory />);
    }
    if (content === "AddOrder") {
      setActiveContent(<AddOrder />);
      setLastClickedContent(<AddOrder />);
    }
    if (content === "ViewProducts") {
      setActiveContent(<ViewProducts />);
      setLastClickedContent(<ViewProducts />);
    }
    if (content === "Products") {
      setActiveContent(<Products />);
      setLastClickedContent(<Products />);
    }
    if (content === "Profile") {
      setActiveContent(<Profile />);
      setLastClickedContent(<Profile />);
    }
    if (content === "Log Out") {
      setActiveContent(null);
      setShowLogoutModal(true);
    }
  };

  const handleOpen = (value) => {
    setOpen(open === value ? 0 : value);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
    setActiveContent(lastClickedContent);
  };

  const handleNotificationClick = (notificationId) => {
    const notificationRef = doc(firestore, "notifications", notificationId);
    updateDoc(notificationRef, { status: "read" }).then(() => {
      setUnreadCount((prevCount) => prevCount - 1);
    });
  };

  const logOutConfirm = () => {
    setLoading(true); // Show loading modal
    setTimeout(() => {
      setLoading(false); // Hide loading modal
      navigate("/Bean&Co.Login"); // Navigate after the delay
    }, 4000); // 4000 milliseconds = 4 seconds
  };

  return (
    <div className="flex h-[100vh]">
      {/* Sidebar */}
      <Card
        className={`h-full w-64 transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:block fixed top-0 left-0 bottom-0 z-999 overflow-y-auto border-r border-gray-300`}
      >
        <div className="absolute top-4 right-4 z-10 cursor-pointer lg:hidden">
          <button
            onClick={closeSidebar} // Close sidebar when X is clicked
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <div className="sticky top-0 pt-6 pb-4 mb-2">
          <img src={logo} className="w-30 h-25 mx-auto" />
        </div>

        <List className="overflow-y-auto flex-1">
          {/* Dashboard Accordion */}
          <Accordion
            open={open === 1}
            icon={
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`mx-auto h-4 w-4 transition-transform ${
                  open === 1 ? "rotate-180" : ""
                }`}
              />
            }
          >
            <ListItem className="p-0" selected={open === 1}>
              <AccordionHeader
                onClick={() => handleOpen(1)}
                className="border-b-0 p-3"
              >
                <ListItemPrefix>
                  <img src={dashboardIcon} className="h-6 w-6 text-[#724E2C]" />
                </ListItemPrefix>
                <Typography color="blue-gray" className="mr-auto font-normal">
                  Dashboard
                </Typography>
              </AccordionHeader>
            </ListItem>
            <AccordionBody className="py-1">
              <List className="p-0">
                <ListItem
                  className="cursor-pointer"
                  onClick={() => updateContent("Analytics")}
                >
                  <ListItemPrefix>
                    <ChevronDownIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  <Typography>Analytics</Typography>
                </ListItem>
              </List>
            </AccordionBody>
          </Accordion>

          {/* E-Commerce Accordion */}
          <Accordion
            open={open === 2}
            icon={
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`mx-auto h-4 w-4 transition-transform ${
                  open === 2 ? "rotate-180" : ""
                }`}
              />
            }
          >
            {/* Orders Accordion */}
            <Accordion
              open={open === 5}
              icon={
                <ChevronDownIcon
                  strokeWidth={2.5}
                  className={`mx-auto h-4 w-4 transition-transform ${
                    open === 4 ? "rotate-180" : ""
                  }`}
                />
              }
            >
              <ListItem className="p-0" selected={open === 4}>
                <AccordionHeader
                  onClick={() => handleOpen(5)}
                  className="border-b-0 p-3"
                >
                  <ListItemPrefix>
                    <img src={ordersIcon} className="h-6 w-6 text-[#724E2C]" />
                  </ListItemPrefix>
                  <Typography color="blue-gray" className="mr-auto font-normal">
                    Orders
                  </Typography>
                </AccordionHeader>
              </ListItem>
              <AccordionBody className="py-1">
                <List className="p-0">
                  <ListItem
                    className="cursor-pointer"
                    onClick={() => updateContent("AddOrder")}
                  >
                    <ListItemPrefix>
                      <ChevronDownIcon strokeWidth={3} className="h-3 w-5" />
                    </ListItemPrefix>
                    <Typography>Add Orders </Typography>
                  </ListItem>
                  <ListItem
                    className="cursor-pointer"
                    onClick={() => updateContent("Orders")}
                  >
                    <ListItemPrefix>
                      <ChevronDownIcon strokeWidth={3} className="h-3 w-5" />
                    </ListItemPrefix>
                    <Typography>Manage Orders</Typography>
                  </ListItem>
                </List>
              </AccordionBody>
            </Accordion>
            <ListItem className="p-0" selected={open === 2}>
              <AccordionHeader
                onClick={() => handleOpen(2)}
                className="border-b-0 p-3"
              >
                <ListItemPrefix>
                  <img src={manageLogo} className="h-6 w-6 text-[#724E2C]" />
                </ListItemPrefix>
                <Typography color="blue-gray" className="mr-auto font-normal">
                  Manage Products
                </Typography>
              </AccordionHeader>
            </ListItem>
            <AccordionBody className="py-1">
              <List className="p-0">
                <ListItem
                  className="cursor-pointer"
                  onClick={() => updateContent("Products")}
                >
                  <ListItemPrefix>
                    <ChevronDownIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  <Typography>Add Products</Typography>
                </ListItem>
                <ListItem
                  className="cursor-pointer"
                  onClick={() => updateContent("ViewProducts")}
                >
                  <ListItemPrefix>
                    <ChevronDownIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  <Typography>View Products</Typography>
                </ListItem>
              </List>
            </AccordionBody>
          </Accordion>

          {/* Transactions Accordion */}
          <Accordion
            open={open === 4}
            icon={
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`mx-auto h-4 w-4 transition-transform ${
                  open === 4 ? "rotate-180" : ""
                }`}
              />
            }
          >
            <ListItem className="p-0" selected={open === 4}>
              <AccordionHeader
                onClick={() => handleOpen(4)}
                className="border-b-0 p-3"
              >
                <ListItemPrefix>
                  <img
                    src={transactionsLogo}
                    className="h-6 w-6 text-[#724E2C]"
                  />
                </ListItemPrefix>
                <Typography color="blue-gray" className="mr-auto font-normal">
                  Transactions
                </Typography>
              </AccordionHeader>
            </ListItem>
            <AccordionBody className="py-1">
              <List className="p-0">
                <ListItem
                  className="cursor-pointer"
                  onClick={() => updateContent("PaymentHistory")}
                >
                  <ListItemPrefix>
                    <ChevronDownIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  <Typography>PaymentHistory</Typography>
                </ListItem>
              </List>
            </AccordionBody>
          </Accordion>

          {/* Other Menu Items */}
          <ListItem
            onClick={() => updateContent("Profile")}
            className="group cursor-pointer relative hover:bg-gray-200 p-2"
          >
            <ListItemPrefix onClick={() => updateContent("Profile")}>
              <UserCircleIcon className="h-6 w-6 text-[#724E2C]" />
            </ListItemPrefix>
            <Typography className="ml-2">Profile</Typography>
          </ListItem>

          <ListItem
            onClick={() => updateContent("Log Out")}
            className="group cursor-pointer relative hover:bg-gray-200 p-2"
          >
            <ListItemPrefix>
              <img src={logoutIcon} className="h-6 w-6" />
            </ListItemPrefix>
            <Typography className="ml-2">Log Out</Typography>
          </ListItem>
        </List>
      </Card>

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Top Navbar */}
        <div className="fixed top-0 left-0 right-0 bg-white p-4 border-b border-gray-300 shadow-md z-20">
          <div className="flex justify-between items-center">
            <button onClick={toggleSidebar} className="lg:hidden">
              <Bars3Icon className="h-6 w-6 text-gray-600" />
            </button>
            <div className="flex-1"></div>
            <div className="flex items-center space-x-4">
              {/* Bell Icon */}
              <div className="relative">
                <div
                  className="bg-gray-200 p-2 rounded-full cursor-pointer"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                >
                  <BellIcon className="h-6 w-6 text-[#D3B094]" />
                </div>
                {unreadCount > 0 && (
                  <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
                {isNotificationsOpen && (
                  <div className="absolute top-10 right-0 bg-white p-4 border border-[#D3B094] rounded-lg shadow-md w-120 z-20 max-h-60 overflow-y-auto">
                    <Typography
                      variant="h6"
                      className="font-semibold text-lg text-[#724E2C]"
                    >
                      Notifications
                    </Typography>
                    <div className="space-y-2 mt-2">
                      {notifications.slice(0, limit).map((notification) => (
                        <div
                          key={notification.id}
                          className={`flex  items-center cursor-pointer p-2 rounded-md transition-all duration-200 ${
                            notification.status === "unread"
                              ? "bg-gradient-to-r from-green-50 via-green-200 to-green-100 "
                              : "bg-green-50 hover:bg-green-100"
                          }`}
                          onClick={() =>
                            handleNotificationClick(notification.id)
                          }
                        >
                          <span
                            className={`inline-block w-2.5 h-2.5 mr-2 rounded-full ${
                              notification.status === "unread"
                                ? "bg-orange-500"
                                : "bg-gray-500"
                            }`}
                          ></span>
                          <span
                            className={`text-sm ${
                              notification.status === "unread"
                                ? "font-semibold text-[#724E2C]"
                                : "text-gray-600"
                            }`}
                          >
                            {notification.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Name and Profile Image */}
              <div className="flex flex-col items-start">
                <Typography className="text-gray-800 font-semibold">
                  {userData
                    ? `${userData.firstName} ${userData.lastName}`
                    : "Neil Delante"}
                </Typography>
                <Typography className="text-gray-500 text-sm">Admin</Typography>
              </div>

              <div className="p-2 rounded-full">
                <img
                  src={profile}
                  alt="Profile"
                  className="h-11 w-11 rounded-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content Display */}
        <div className="pt-25 p-8 w-full relative md:left-0 overflow-x-hidden lg:left-55 bg-gray-100">
          {activeContent}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-[rgba(0,0,0,0.3)] z-999">
          <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
            <Typography
              variant="h6"
              className="text-center text-xl font-semibold text-gray-800 mb-6"
            >
              Are you sure you want to log out?
            </Typography>

            {/* Flex container for buttons */}
            <div className="flex space-x-4">
              {/* Cancel Button */}
              <button
                onClick={handleCancelLogout}
                className="w-full px-6 py-2 cursor-pointer bg-gray-300 hover:bg-gray-200 text-md text-gray-800 rounded-lg flex justify-center items-center"
              >
                Cancel
              </button>

              {/* Confirm Button */}
              <button
                onClick={logOutConfirm}
                className="w-full px-6 py-2 cursor-pointer bg-red-500 hover:bg-red-300 text-md text-white rounded-lg flex justify-center items-center"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {loading && <LoadingModal />}
    </div>
  );
}
