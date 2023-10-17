import React from "react";
import PageTitle from "../components/Typography/PageTitle";
import { useState } from "react";
import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TableFooter,
  TableContainer,
  Avatar,
  Button,
  Pagination,
} from "@windmill/react-ui";

import { EditIcon, TrashIcon } from "../icons";
import { useGlobalContext } from "../context/GlobalContext";
import ThemedSuspense from "../components/ThemedSuspense";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@windmill/react-ui";
import { Link } from "react-router-dom/cjs/react-router-dom";

const Projects = () => {
  const { projectsFromDB, projectsFromDBLoader, handleDeleteProject } =
    useGlobalContext();

  console.log(projectsFromDB);

  const [pageTable2, setPageTable2] = useState(1);

  const [dataTable2, setDataTable2] = useState([]);

  // pagination setup
  const resultsPerPage = 10;
  const totalResults = projectsFromDB?.length;

  // pagination change control
  function onPageChangeTable2(p) {
    setPageTable2(p);
  }

  // on page change, load new sliced data
  // here you would make another server request for new data
  useEffect(() => {
    setDataTable2(
      projectsFromDB?.slice(
        (pageTable2 - 1) * resultsPerPage,
        pageTable2 * resultsPerPage
      )
    );
  }, [pageTable2, projectsFromDB]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const handleOpenDeleteModal = (project) => {
    setShowDeleteModal(true);
    setProjectToDelete(project);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  if (projectsFromDBLoader) {
    return <ThemedSuspense />;
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <PageTitle>Projects</PageTitle>

        <NavLink to="/app/create-project">
          <Button>Add Project</Button>
        </NavLink>
      </div>

      <Modal isOpen={showDeleteModal} onClose={handleCloseDeleteModal}>
        <ModalHeader>Confirm Delete</ModalHeader>
        <ModalBody>
          Are you sure you want to delete the project:{" "}
          {projectToDelete && projectToDelete.projectName}?
        </ModalBody>
        <ModalFooter>
          <Button layout="outline" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleDeleteProject(projectToDelete.id);
              handleCloseDeleteModal();
            }}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>

      <TableContainer className="mb-8">
        <Table>
          <TableHeader>
            <tr>
              <TableCell>Name</TableCell>
              <TableCell>Link</TableCell>

              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {dataTable2.map((project, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <Avatar
                      className="hidden mr-3 md:block"
                      src={project.imgUrl}
                      alt="project avatar"
                    />
                    <div>
                      <p className="font-semibold">{project.projectName}</p>
                      <p className="font-semibold">{project.type || ""}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{project.projectLink}</span>
                </TableCell>

                <TableCell>
                  <span className="text-sm">
                    {/* {new Date().toLocaleDateString()} */}
                    {project.createdAt.toDate().toLocaleDateString() || ""}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-4">
                    <Button
                      tag={Link}
                      to={`edit-project/${project.id}`}
                      layout="link"
                      size="icon"
                      aria-label="Edit"
                    >
                      <EditIcon className="w-5 h-5" aria-hidden="true" />
                    </Button>
                    <Button
                      onClick={() => handleOpenDeleteModal(project)}
                      layout="link"
                      size="icon"
                      aria-label="Delete"
                    >
                      <TrashIcon className="w-5 h-5" aria-hidden="true" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TableFooter>
          <Pagination
            totalResults={totalResults}
            resultsPerPage={resultsPerPage}
            onChange={onPageChangeTable2}
            label="Table navigation"
          />
        </TableFooter>
      </TableContainer>
    </div>
  );
};

export default Projects;
