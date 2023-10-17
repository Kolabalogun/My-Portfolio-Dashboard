import React from "react";
import PageTitle from "../components/Typography/PageTitle";
import { Button } from "@windmill/react-ui";

import { Input, HelperText, Label, Textarea } from "@windmill/react-ui";
import SectionTitle from "../components/Typography/SectionTitle";
import { useGlobalContext } from "../context/GlobalContext";
import { useState } from "react";
import { useEffect } from "react";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "../utils/Firebase";
import {
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import ThemedSuspense from "../components/ThemedSuspense";

// form  initial state
const initialState = {
  homeSectionCaption: "",
  homeSectionVidUrl: "",
  aboutTitle: "",
  aboutDescription: "",
  aboutImgUrl: "",
  serviceTitle: "",
  serviceDescription: "",
  serviceTypeITitle: "",
  serviceTypeIDescription: "",
  serviceTypeIImgUrl: "",
  serviceTypeIITitle: "",
  serviceTypeIIDescription: "",
  serviceTypeIIImgUrl: "",
  serviceTypeIIITitle: "",
  serviceTypeIIIDescription: "",
  serviceTypeIIIImgUrl: "",
  videoDisplayVidUrl: "",
  recentWorkLink: "",
  contactPhone: "",
  contactEmail: "",
  contactYoutubeName: "",
  contactYoutubeLink: "",
  footerFacebookLink: "",
  footerTwitterLink: "",
  footerInstagramLink: "",
  footerLinkedInLink: "",
};

const PageContents = () => {
  // get data from context
  const { notification, setnotification, loading, setloading, pageContent } =
    useGlobalContext();

  // form state
  const [form, setform] = useState(initialState);

  //update form

  useEffect(() => {
    if (pageContent) {
      setform(pageContent);
    }
  }, [pageContent]);

  // file upload state
  const [files, setFiles] = useState([]);

  // file upload progress state
  const [progress, setprogress] = useState(null);

  const {
    homeSectionCaption,
    homeSectionVidUrl,
    aboutTitle,
    aboutDescription,
    aboutImgUrl,
    serviceTitle,
    serviceDescription,
    serviceTypeITitle,
    serviceTypeIDescription,
    serviceTypeIImgUrl,
    serviceTypeIITitle,
    serviceTypeIIDescription,
    serviceTypeIIImgUrl,
    serviceTypeIIITitle,
    serviceTypeIIIDescription,
    serviceTypeIIIImgUrl,
    videoDisplayVidUrl,
    recentWorkLink,
    contactPhone,
    contactEmail,
    contactYoutubeName,
    contactYoutubeLink,
    footerFacebookLink,
    footerTwitterLink,
    footerInstagramLink,
    footerLinkedInLink,
  } = form;

  // handle change text
  const handleChange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value });
  };

  // handle change image files
  const handleChangeFiles = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFiles((prevFiles) => [...prevFiles, { name, file: files[0] }]);
    }
  };

  // handle submit
  const handleSubmit = async () => {
    if (
      homeSectionCaption &&
      // homeSectionVidUrl &&
      aboutTitle &&
      aboutDescription &&
      // aboutImgUrl &&
      serviceTitle &&
      serviceDescription &&
      serviceTypeITitle &&
      serviceTypeIDescription &&
      // serviceTypeIImgUrl &&
      serviceTypeIITitle &&
      serviceTypeIIDescription &&
      // serviceTypeIIImgUrl &&
      serviceTypeIIITitle &&
      serviceTypeIIIDescription &&
      // serviceTypeIIIImgUrl &&
      // videoDisplayVidUrl &&
      recentWorkLink &&
      contactPhone &&
      contactEmail &&
      contactYoutubeName &&
      contactYoutubeLink
    ) {
      setloading(true);

      try {
        // Upload each file in the files array to Firebase Storage
        const uploadedFiles = await Promise.all(
          files.map(async (fileObj) => {
            const storageRef = ref(storage, `${fileObj.name}`);
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
          homeSectionVidUrl:
            uploadedFiles.find((file) => file.name === "homeSectionVidUrl")
              ?.url || form.homeSectionVidUrl,
          aboutImgUrl:
            uploadedFiles.find((file) => file.name === "aboutImgUrl")?.url ||
            form.aboutImgUrl,
          serviceTypeIImgUrl:
            uploadedFiles.find((file) => file.name === "serviceTypeIImgUrl")
              ?.url || form.serviceTypeIImgUrl,
          serviceTypeIIImgUrl:
            uploadedFiles.find((file) => file.name === "serviceTypeIIImgUrl")
              ?.url || form.serviceTypeIIImgUrl,
          serviceTypeIIIImgUrl:
            uploadedFiles.find((file) => file.name === "serviceTypeIIIImgUrl")
              ?.url || form.serviceTypeIIIImgUrl,
          videoDisplayVidUrl:
            uploadedFiles.find((file) => file.name === "videoDisplayVidUrl")
              ?.url || form.videoDisplayVidUrl,
        };

        // Update the document in Firestore
        const collectionRef = collection(db, "Page content");
        const docRef = doc(collectionRef, "5TpYbWjWzBZXUJmKpN32");
        await updateDoc(docRef, {
          ...updatedForm,
          updatedAt: serverTimestamp(),
        });

        setnotification("Content Successfully Updated");

        setFiles([]); // Clear the files array after successful upload
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

  if (loading) {
    return <ThemedSuspense />;
  }

  return (
    <div>
      <PageTitle>Page Contents</PageTitle>

      <SectionTitle>Hero Section</SectionTitle>
      <div className="px-4 py-8 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800 ">
        <Label>
          <span>Hero Caption</span>
          <Textarea
            className="mt-1"
            rows="3"
            name="homeSectionCaption"
            value={homeSectionCaption}
            onChange={handleChange}
            placeholder="Enter some  content."
          />
        </Label>

        <Label className="mt-5">
          <span>Cover Video</span>
          <Input
            type="file"
            name="homeSectionVidUrl"
            onChange={handleChangeFiles}
            className="mt-1"
          />
        </Label>
      </div>

      <SectionTitle>About</SectionTitle>
      <div className="px-4 py-8 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800 ">
        <Label>
          <span>About Title</span>
          <Input
            className="mt-1"
            name="aboutTitle"
            value={aboutTitle}
            onChange={handleChange}
            placeholder="Barbie - The Movie"
          />
        </Label>

        <Label className="mt-5">
          <span>Description</span>
          <Textarea
            className="mt-1"
            rows="3"
            name="aboutDescription"
            value={aboutDescription}
            onChange={handleChange}
            placeholder="Enter some  content."
          />
        </Label>

        <div className="flex flex-col  mt-5">
          {aboutImgUrl && (
            <div className=" mb-5 rounded-lg">
              <img
                className="rounded-lg object-cover   h-64"
                src={aboutImgUrl}
                alt="cover"
              />
            </div>
          )}

          <Label className="mt-5">
            <span>Illustration Image</span>
            <Input
              type="file"
              name="aboutImgUrl"
              onChange={handleChangeFiles}
              className="mt-1"
            />
          </Label>
        </div>
      </div>

      <SectionTitle>Services</SectionTitle>
      <div className="px-4 py-8 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800 ">
        <Label>
          <span>Title</span>
          <Input
            className="mt-1"
            name="serviceTitle"
            value={serviceTitle}
            onChange={handleChange}
            placeholder="Barbie - The Movie"
          />
        </Label>

        <Label className="mt-5">
          <span>Description</span>
          <Textarea
            className="mt-1"
            rows="3"
            name="serviceDescription"
            value={serviceDescription}
            onChange={handleChange}
            placeholder="Enter some  content."
          />
        </Label>
        <Label className="mt-5">
          <span>Service Type I</span>
          <Input
            className="mt-1"
            name="serviceTypeITitle"
            value={serviceTypeITitle}
            onChange={handleChange}
            placeholder="Barbie - The Movie"
          />
        </Label>

        <Label className="mt-5">
          <span>Type I Description</span>
          <Textarea
            className="mt-1"
            rows="3"
            name="serviceTypeIDescription"
            value={serviceTypeIDescription}
            onChange={handleChange}
            placeholder="Enter some  content."
          />
        </Label>

        <div className="flex flex-col  mt-5">
          <span className="text-white mb-1 text-xs">Type I Svg</span>
          {serviceTypeIImgUrl && (
            <div className=" mb-5 rounded-lg">
              <img
                className="rounded-lg object-cover   h-16"
                src={serviceTypeIImgUrl}
                alt="cover"
              />
            </div>
          )}
          <Label className="mt-1">
            <span>Type I Svg</span>
            <Input
              type="file"
              name="serviceTypeIImgUrl"
              onChange={handleChangeFiles}
              className="mt-1"
            />
          </Label>
        </div>

        <Label className="mt-5">
          <span>Service Type II</span>
          <Input
            className="mt-1"
            name="serviceTypeIITitle"
            value={serviceTypeIITitle}
            onChange={handleChange}
            placeholder="Barbie - The Movie"
          />
        </Label>

        <Label className="mt-5">
          <span>Type II Description</span>
          <Textarea
            className="mt-1"
            rows="3"
            name="serviceTypeIIDescription"
            value={serviceTypeIIDescription}
            onChange={handleChange}
            placeholder="Enter some  content."
          />
        </Label>

        <div className="flex flex-col  mt-5">
          <span className="text-white mb-1 text-xs">Type II Svg</span>
          {serviceTypeIIImgUrl && (
            <div className=" mb-1 rounded-lg">
              <img
                className="rounded-lg object-cover   h-16"
                src={serviceTypeIIImgUrl}
                alt="cover"
              />
            </div>
          )}

          <Label className="mt-4">
            <span>Type II Svg</span>
            <Input
              type="file"
              name="serviceTypeIIImgUrl"
              onChange={handleChangeFiles}
              className="mt-1"
            />
          </Label>
        </div>
        <Label className="mt-5">
          <span>Service Type III</span>
          <Input
            className="mt-1"
            name="serviceTypeIIITitle"
            value={serviceTypeIIITitle}
            onChange={handleChange}
            placeholder="Barbie - The Movie"
          />
        </Label>

        <Label className="mt-5">
          <span>Type III Description</span>
          <Textarea
            className="mt-1"
            rows="3"
            name="serviceTypeIIIDescription"
            value={serviceTypeIIIDescription}
            onChange={handleChange}
            placeholder="Enter some  content."
          />
        </Label>

        <div className="flex flex-col  mt-5">
          <span className="text-white mb-1 text-xs">Type III Svg</span>
          {serviceTypeIIIImgUrl && (
            <div className=" mb-1 rounded-lg">
              <img
                className="rounded-lg object-cover   h-16"
                src={serviceTypeIIIImgUrl}
                alt="cover"
              />
            </div>
          )}

          <Label className="mt-4">
            <span>Type III Svg</span>
            <Input
              type="file"
              name="serviceTypeIIIImgUrl"
              onChange={handleChangeFiles}
              className="mt-1"
            />
          </Label>
        </div>
      </div>

      <SectionTitle>Video Display</SectionTitle>
      <div className="px-4 py-8 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800 ">
        <Label>
          <span>Cover Video</span>
          <Input
            type="file"
            name="videoDisplayVidUrl"
            onChange={handleChangeFiles}
            className="mt-1"
          />
        </Label>

        <Label>
          <span>Cover Video Link</span>
          <Input
            type="text"
            name="videoDisplayVidUrl"
            value={videoDisplayVidUrl}
            onChange={handleChange}
            className="mt-1"
            placeholder="Enter Display video link"
          />
        </Label>
      </div>

      <SectionTitle>Recent Work</SectionTitle>
      <div className="px-4 py-8 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800 ">
        <Label>
          <span>Link</span>
          <Input
            className="mt-1"
            name="recentWorkLink"
            value={recentWorkLink}
            onChange={handleChange}
            placeholder="https://www.youtube.com"
          />
        </Label>
      </div>

      <SectionTitle>Contact</SectionTitle>
      <div className="px-4 py-8 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800 ">
        <Label>
          <span>Email</span>
          <Input
            type="email"
            name="contactEmail"
            value={contactEmail}
            onChange={handleChange}
            className="mt-1"
            placeholder="ibrahim@gmail.com"
          />
        </Label>
        <Label className="mt-5">
          <span>Phone</span>
          <Input
            type="number"
            name="contactPhone"
            value={contactPhone}
            onChange={handleChange}
            className="mt-1"
            placeholder="+1 80 9000 8999"
          />
        </Label>

        <Label className="mt-5">
          <span>Youtube Page Name</span>
          <Input
            className="mt-1"
            name="contactYoutubeName"
            value={contactYoutubeName}
            onChange={handleChange}
            rows="3"
            placeholder="Add your page name "
          />
        </Label>
        <Label className="mt-5">
          <span>Youtube Link</span>
          <Input
            className="mt-1"
            name="contactYoutubeLink"
            value={contactYoutubeLink}
            onChange={handleChange}
            rows="3"
            placeholder="Add your Link "
          />
        </Label>

        <div className="flex md:flex-row flex-col gap-5">
          <Label className="mt-5 flex-1">
            <span>Twitter Link</span>
            <Input
              className="mt-1 "
              name="footerTwitterLink"
              value={footerTwitterLink}
              onChange={handleChange}
              rows="3"
              placeholder="Add your Link "
            />
          </Label>
          <Label className="mt-5 flex-1">
            <span>Instagram Link</span>
            <Input
              className="mt-1 "
              name="footerFacebookLink"
              value={footerFacebookLink}
              onChange={handleChange}
              rows="3"
              placeholder="Add your Link "
            />
          </Label>
          <Label className="mt-5 flex-1">
            <span>Instagram Link II</span>
            <Input
              className="mt-1 "
              name="footerInstagramLink"
              value={footerInstagramLink}
              onChange={handleChange}
              rows="3"
              placeholder="Add your Link "
            />
          </Label>
          <Label className="mt-5 flex-1">
            <span>LinkedIn Link</span>
            <Input
              className="mt-1 "
              name="footerLinkedInLink"
              value={footerLinkedInLink}
              onChange={handleChange}
              rows="3"
              placeholder="Add your Link "
            />
          </Label>
        </div>
      </div>
      <div className="mt-5">
        <Button disabled={loading} onClick={handleSubmit}>
          {loading ? <div class="lds-dual-ring"></div> : "Submit"}
        </Button>
      </div>
      <div className="py-3 h-5">
        <HelperText valid={false}>{notification}</HelperText>
      </div>
    </div>
  );
};

export default PageContents;
