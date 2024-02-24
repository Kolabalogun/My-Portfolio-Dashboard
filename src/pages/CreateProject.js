import React, { useEffect, useState } from "react";
import PageTitle from "../components/Typography/PageTitle";
import { Button } from "@windmill/react-ui";
import { NavLink } from "react-router-dom";
import { Input, HelperText, Label, Select, Textarea } from "@windmill/react-ui";
import { useGlobalContext } from "../context/GlobalContext";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "../utils/Firebase";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useParams } from "react-router-dom/cjs/react-router-dom";
import { fetchFirestoreData } from "../Hook/fetchFirestoreData";

const CreateProject = () => {
  // get data from context
  const { notification, setnotification, loading, setloading } =
    useGlobalContext();

  const { id } = useParams();

  // form  initial state
  const initialState = {
    projectName: "",
    client: "",
    projectLink: "",
    gitHubLink: "",
    imgUrl: "",
    type: "",
    resourceI: "",
    resourceII: "",
    resourceIII: "",
    projectIimage: "",
    projectIIIimage: "",
    projectIIimage: "",
    Description: "",
  };

  // form state
  const [form, setform] = useState(initialState);

  // get document info if ID is present
  const getPageContentDetail = async () => {
    setloading(true);
    const data = await fetchFirestoreData("Projects", id);
    if (data) {
      setform(data);
    }
    setloading(false);
  };

  useEffect(() => {
    getPageContentDetail();
  }, [id, setloading]);

  // file upload state
  const [files, setFiles] = useState([]);

  // file upload progress state
  const [progress, setprogress] = useState(null);

  const [dateId, setdateId] = useState("");

  const setDateID = () => {
    const dateId = new Date().getTime();
    setdateId(dateId);
  };

  // to set timeId
  useEffect(() => {
    setDateID();
  }, []);

  const {
    projectName,
    imgUrl,
    Description,
    projectLink,
    gitHubLink,
    type,
    resourceI,
    resourceII,
    resourceIII,
    client,
    projectIimage,
    projectIIimage,
    projectIIIimage,
  } = form;

  // handle change image files
  const handleChangeFiles = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFiles((prevFiles) => [...prevFiles, { name, file: files[0] }]);
    }
  };

  // handle change text
  const handleChange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value });
  };

  // handle submit
  const handleSubmit = async () => {
    if (projectName) {
      setloading(true);

      try {
        // Upload each file in the files array to Firebase Storage
        const uploadedFiles = await Promise.all(
          files.map(async (fileObj) => {
            const storageRef = ref(storage, `${dateId}${fileObj.name}`);
            const uploadTask = uploadBytesResumable(storageRef, fileObj.file);

            // Get the upload progress (optional)
            uploadTask.on("state_changed", (snapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setprogress(progress);
            });
            setnotification(`Upload is ${progress}% done`);

            // Wait for the upload to complete and get the download URL
            await uploadTask;
            const downloadURL = await getDownloadURL(storageRef);
            return { name: fileObj.name, url: downloadURL };
          })
        );

        // Create a copy of the form state with updated image URLs
        const updatedForm = {
          ...form,
          // Only update image URLs if new images are uploaded, otherwise, keep the existing URLs
          imgUrl:
            uploadedFiles.find((file) => file.name === "imgUrl")?.url ||
            form.imgUrl ||
            "",
          projectIimage:
            uploadedFiles.find((file) => file.name === "projectIimage")?.url ||
            form.projectIimage ||
            "",
          projectIIimage:
            uploadedFiles.find((file) => file.name === "projectIIimage")?.url ||
            form.projectIIimage ||
            "",
          projectIIIimage:
            uploadedFiles.find((file) => file.name === "projectIIIimage")
              ?.url ||
            form.projectIIIimage ||
            "",
        };

        await addDoc(collection(db, "Projects"), {
          ...updatedForm,
          dateId,
          createdAt: serverTimestamp(),
        });
        setnotification("Project Successfully Added");
        setform(initialState);
        setDateID();
        setloading(false);
      } catch (error) {
        console.log(error);
        setnotification(error);
        setloading(false);
      }
    } else {
      return setnotification("All fields must be filled");
    }
  };

  // handle submit
  const handleUpdate = async () => {
    if (projectName) {
      setloading(true);

      try {
        // Upload each file in the files array to Firebase Storage
        const uploadedFiles = await Promise.all(
          files.map(async (fileObj) => {
            const storageRef = ref(storage, `${dateId}${fileObj.name}`);
            const uploadTask = uploadBytesResumable(storageRef, fileObj.file);

            // Get the upload progress (optional)
            uploadTask.on("state_changed", (snapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setprogress(progress);
            });
            setnotification(`Upload is ${progress}% done`);

            // Wait for the upload to complete and get the download URL
            await uploadTask;
            const downloadURL = await getDownloadURL(storageRef);
            return { name: fileObj.name, url: downloadURL };
          })
        );

        // Create a copy of the form state with updated image URLs
        const updatedForm = {
          ...form,
          // Only update image URLs if new images are uploaded, otherwise, keep the existing URLs
          imgUrl:
            uploadedFiles.find((file) => file.name === "imgUrl")?.url ||
            form.imgUrl,
          projectIimage:
            uploadedFiles.find((file) => file.name === "projectIimage")?.url ||
            form.projectIimage,
          projectIIimage:
            uploadedFiles.find((file) => file.name === "projectIIimage")?.url ||
            form.projectIIimage,
          projectIIIimage:
            uploadedFiles.find((file) => file.name === "projectIIIimage")
              ?.url || form.projectIIIimage,
        };

        // Update the document in Firestore
        const collectionRef = collection(db, "Projects");
        const docRef = doc(collectionRef, id);
        await updateDoc(docRef, {
          ...updatedForm,
          updatedAt: serverTimestamp(),
        });

        setnotification("Project Successfully Updated");
        getPageContentDetail();
        setDateID();
        setloading(false);
      } catch (error) {
        console.log(error);
        setnotification(error);
        setloading(false);
      }
    } else {
      setnotification("All fields must be filled");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <PageTitle>{id ? "Edit Project" : "Create Project"}</PageTitle>

        <NavLink to="/app/projects">
          <Button>See Projects</Button>
        </NavLink>
      </div>

      <div className="px-4 py-8 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800 ">
        <Label>
          <span>Project Namee</span>
          <Input
            className="mt-1"
            name="projectName"
            value={projectName}
            onChange={handleChange}
            placeholder="Unilorin League"
          />
        </Label>

        <div className="flex flex-col  mt-5">
          {imgUrl && (
            <div className=" mb-5 rounded-lg">
              <img
                className="rounded-lg object-cover   h-64"
                src={imgUrl}
                alt="cover"
              />
            </div>
          )}

          <Label className="">
            <span>Cover Image</span>
            <Input
              type="file"
              name="imgUrl"
              onChange={handleChangeFiles}
              className="mt-1"
            />
          </Label>
        </div>

        <Label className="mt-5">
          <span>Client</span>
          <Input
            className="mt-1"
            name="client"
            value={client}
            onChange={handleChange}
            placeholder="Client"
          />
        </Label>

        <Label className="mt-5">
          <span>Project Type</span>
          <Input
            className="mt-1"
            name="type"
            value={type}
            onChange={handleChange}
            placeholder="web or mobile"
          />
        </Label>

        <Label className="mt-5">
          <span>Project Description</span>
          <Textarea
            rows="6"
            className="mt-1"
            name="Description"
            value={Description}
            onChange={handleChange}
            placeholder="Project description"
          />
        </Label>

        <div className="flex justify-between flex-col md:flex-row gap-10">
          <Label className="mt-5">
            <span>Resource I</span>
            <Input
              className="mt-1"
              name="resourceI"
              value={resourceI}
              onChange={handleChange}
              placeholder=""
            />
          </Label>

          <Label className="mt-5">
            <span>Resource II</span>
            <Input
              className="mt-1"
              name="resourceII"
              value={resourceII}
              onChange={handleChange}
              placeholder=""
            />
          </Label>

          <Label className="mt-5">
            <span>Resource III</span>
            <Input
              className="mt-1"
              name="resourceIII"
              value={resourceIII}
              onChange={handleChange}
              placeholder=""
            />
          </Label>
        </div>

        <Label className="mt-5">
          <span>Project Linkkk</span>
          <Input
            className="mt-1"
            name="projectLink"
            value={projectLink}
            onChange={handleChange}
            placeholder="https://www.youtube.com"
          />
        </Label>

        <Label className="mt-5">
          <span>GitHub Link</span>
          <Input
            className="mt-1"
            name="gitHubLink"
            value={gitHubLink}
            onChange={handleChange}
            placeholder="https://www.github.com/kolabalogun"
          />
        </Label>

        <div className="flex flex-col  mt-5">
          {projectIimage && (
            <div className=" mb-1 rounded-lg">
              <img
                className="rounded-lg object-cover   h-16"
                src={projectIimage}
                alt="cover"
              />
            </div>
          )}

          <Label className="mt-4">
            <span>Project I Image</span>
            <Input
              type="file"
              name="projectIimage"
              onChange={handleChangeFiles}
              className="mt-1"
            />
          </Label>
        </div>
        <div className="flex flex-col  mt-5">
          {projectIIimage && (
            <div className=" mb-1 rounded-lg">
              <img
                className="rounded-lg object-cover   h-16"
                src={projectIIimage}
                alt="cover"
              />
            </div>
          )}

          <Label className="mt-4">
            <span>Project II Image</span>
            <Input
              type="file"
              name="projectIIimage"
              onChange={handleChangeFiles}
              className="mt-1"
            />
          </Label>
        </div>
        <div className="flex flex-col  mt-5">
          {projectIIIimage && (
            <div className=" mb-1 rounded-lg">
              <img
                className="rounded-lg object-cover   h-16"
                src={projectIIIimage}
                alt="cover"
              />
            </div>
          )}

          <Label className="mt-4">
            <span>Project III Image</span>
            <Input
              type="file"
              name="projectIIIimage"
              onChange={handleChangeFiles}
              className="mt-1"
            />
          </Label>
        </div>

        <div className="mt-5">
          <Button disabled={loading} onClick={id ? handleUpdate : handleSubmit}>
            {loading ? <div class="lds-dual-ring"></div> : "Submit"}
          </Button>
        </div>
        <div className="py-3 h-5">
          <HelperText valid={false}>{notification}</HelperText>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
