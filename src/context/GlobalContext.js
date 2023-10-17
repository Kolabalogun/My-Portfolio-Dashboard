import { signOut } from "firebase/auth";
import React, { useState, createContext, useContext, useEffect } from "react";
import { auth, db } from "../utils/Firebase";
import useFirestoreCollection from "../Hook/useFirestoreCollection";
import { deleteDoc, doc } from "firebase/firestore";
import { fetchFirestoreData } from "../Hook/fetchFirestoreData";
import { useDispatch } from "react-redux";
import { loginUser, userName } from "../app/features/auth/authSlice";

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const dispatch = useDispatch();

  // firebase check if user is signed in
  useEffect(() => {
    auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        dispatch(loginUser(authUser.uid));
        dispatch(userName(authUser.displayName));
        localStorage.setItem("userId", authUser.uid);
        localStorage.setItem("userName", authUser.displayName);
      } else {
        dispatch(loginUser(null));
        dispatch(userName(null));
        localStorage.setItem("userId", null);
        localStorage.setItem("userName", null);
      }
    });
  }, [dispatch]);

  //   logging out user
  const handleLogout = async () => {
    signOut(auth).then(() => {
      dispatch(loginUser(null));
      dispatch(userName(null));
      window.location.href = "/login";
    });
  };

  //loading state
  const [loading, setloading] = useState(false);

  //notification state
  const [notification, setnotification] = useState("");

  //  notification timeout
  useEffect(() => {
    const timeoutt = setTimeout(() => {
      setnotification("");
    }, 3000);

    return () => {
      clearInterval(timeoutt);
    };
  }, [notification]);

  // get projects from firestore

  const { data: projectsFromDB, loader: projectsFromDBLoader } =
    useFirestoreCollection("Projects");

  // get projects from firestore

  const { data: adminsFromDB, loader: adminsFromDBLoader } =
    useFirestoreCollection("Admin Users");

  // get page count
  const [viewsCount, setViewsCount] = useState({
    count: 0,
  });

  useEffect(() => {
    const getViewsCountDetail = async () => {
      setloading(true);
      const data = await fetchFirestoreData("pageViews", "homepage");
      if (data) {
        setViewsCount(data);
      }
      setloading(false);
    };

    getViewsCountDetail();
  }, []);

  // general function to delete documents
  const deleteDocument = async (collectionName, id) => {
    try {
      setloading(true);
      await deleteDoc(doc(db, collectionName, id));
      alert("Deleted Successfully");
      setloading(false);
    } catch (error) {
      console.log(error);
    }
  };

  // delete projects
  const handleDeleteProject = async (id) => {
    await deleteDocument("Projects", id);
  };

  return (
    <AppContext.Provider
      value={{
        handleLogout,

        loading,
        setloading,
        notification,
        setnotification,
        projectsFromDB,
        projectsFromDBLoader,
        viewsCount,
        handleDeleteProject,
        adminsFromDBLoader,
        adminsFromDB,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

const useGlobalContext = () => {
  return useContext(AppContext);
};

export { useGlobalContext, AppProvider };
