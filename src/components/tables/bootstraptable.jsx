import React from "react";
import { Card, Col, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import avatar1 from "../../assets/images/avatar/1.jpg";
import avatar2 from "../../assets/images/avatar/2.jpg";
import avatar3 from "../../assets/images/avatar/3.jpg";

const BootstrapTable = ({ moduleSlug }) => {
  const chackboxFun = (type) => {
    setTimeout(() => {
      const chackbox = document.querySelectorAll(".bs_exam_topper input");
      const motherChackBox = document.querySelector(".bs_exam_topper_all input");

      if (!motherChackBox) return;

      for (let i = 0; i < chackbox.length; i++) {
        const element = chackbox[i];
        if (type === "all") {
          element.checked = motherChackBox.checked;
        } else if (!element.checked) {
          motherChackBox.checked = false;
          break;
        } else {
          motherChackBox.checked = true;
        }
      }
    }, 100);
  };

  return (
    <Col lg={12}>
      <Card>
        <Card.Header>
          <Card.Title>Gym Toppers</Card.Title>
          <Link to={`/admin/${moduleSlug}/add`} className="btn btn-primary btn-sm">
            <i className="fa fa-plus me-1" />
            Add
          </Link>
        </Card.Header>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr>
                <th className="width50 ">
                  <div className="form-check custom-checkbox checkbox-primary check-lg me-3 bs_exam_topper_all">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`checkAll-${moduleSlug}`}
                      required=""
                      onClick={() => chackboxFun("all")}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`checkAll-${moduleSlug}`}
                    ></label>
                  </div>
                </th>
                <th>Roll No.</th>
                <th>Name</th>
                <th>Email</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="form-check custom-checkbox checkbox-primary check-lg me-3 bs_exam_topper">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`customCheckBox2-${moduleSlug}`}
                      required=""
                      onClick={() => chackboxFun()}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`customCheckBox2-${moduleSlug}`}
                    ></label>
                  </div>
                </td>
                <td>
                  <strong>542</strong>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <img src={avatar1} className="rounded-lg me-2" width="24" alt="" />{" "}
                    <span className="w-space-no">Dr. Jackson</span>
                  </div>
                </td>
                <td>example@example.com </td>
                <td>01 August 2023</td>
                <td>
                  <div className="d-flex align-items-center">
                    <i className="fa fa-circle text-success me-1"></i> Successful
                  </div>
                </td>
                <td>
                  <div className="d-flex">
                    <Link
                      to={`/admin/${moduleSlug}/view`}
                      className="btn btn-info shadow btn-xs sharp me-1"
                    >
                      <i className="fa fa-eye"></i>
                    </Link>
                    <Link
                      to={`/admin/${moduleSlug}/update`}
                      className="btn btn-primary shadow btn-xs sharp me-1"
                    >
                      <i className="fas fa-pen"></i>
                    </Link>
                    <Link
                      to={`/admin/${moduleSlug}/deleted`}
                      className="btn btn-danger shadow btn-xs sharp me-1"
                    >
                      <i className="fa fa-trash"></i>
                    </Link>
                    <Link
                      to={`/admin/${moduleSlug}/status`}
                      className="btn btn-warning shadow btn-xs sharp"
                    >
                      <i className="fa fa-toggle-on"></i>
                    </Link>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="form-check custom-checkbox checkbox-primary check-lg me-3 bs_exam_topper">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`customCheckBox3-${moduleSlug}`}
                      required=""
                      onClick={() => chackboxFun()}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`customCheckBox3-${moduleSlug}`}
                    ></label>
                  </div>
                </td>
                <td>
                  <strong>542</strong>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <img src={avatar2} className="rounded-lg me-2" width="24" alt="" />{" "}
                    <span className="w-space-no">Dr. Jackson</span>
                  </div>
                </td>
                <td>example@example.com </td>
                <td>01 August 2023</td>
                <td>
                  <div className="d-flex align-items-center">
                    <i className="fa fa-circle text-danger me-1"></i> Canceled
                  </div>
                </td>
                <td>
                  <div className="d-flex">
                    <Link
                      to={`/admin/${moduleSlug}/view`}
                      className="btn btn-info shadow btn-xs sharp me-1"
                    >
                      <i className="fa fa-eye"></i>
                    </Link>
                    <Link
                      to={`/admin/${moduleSlug}/update`}
                      className="btn btn-primary shadow btn-xs sharp me-1"
                    >
                      <i className="fas fa-pen"></i>
                    </Link>
                    <Link
                      to={`/admin/${moduleSlug}/deleted`}
                      className="btn btn-danger shadow btn-xs sharp me-1"
                    >
                      <i className="fa fa-trash"></i>
                    </Link>
                    <Link
                      to={`/admin/${moduleSlug}/status`}
                      className="btn btn-warning shadow btn-xs sharp"
                    >
                      <i className="fa fa-toggle-on"></i>
                    </Link>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="form-check custom-checkbox checkbox-primary check-lg me-3 bs_exam_topper">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`customCheckBox4-${moduleSlug}`}
                      required=""
                      onClick={() => chackboxFun()}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`customCheckBox4-${moduleSlug}`}
                    ></label>
                  </div>
                </td>
                <td>
                  <strong>542</strong>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <img src={avatar3} className="rounded-lg me-2" width="24" alt="" />{" "}
                    <span className="w-space-no">Dr. Jackson</span>
                  </div>
                </td>
                <td>example@example.com </td>
                <td>01 August 2023</td>
                <td>
                  <div className="d-flex align-items-center">
                    <i className="fa fa-circle text-warning me-1"></i> Pending
                  </div>
                </td>
                <td>
                  <div className="d-flex">
                    <Link
                      to={`/admin/${moduleSlug}/view`}
                      className="btn btn-info shadow btn-xs sharp me-1"
                    >
                      <i className="fa fa-eye"></i>
                    </Link>
                    <Link
                      to={`/admin/${moduleSlug}/update`}
                      className="btn btn-primary shadow btn-xs sharp me-1"
                    >
                      <i className="fas fa-pen"></i>
                    </Link>
                    <Link
                      to={`/admin/${moduleSlug}/deleted`}
                      className="btn btn-danger shadow btn-xs sharp me-1"
                    >
                      <i className="fa fa-trash"></i>
                    </Link>
                    <Link
                      to={`/admin/${moduleSlug}/status`}
                      className="btn btn-warning shadow btn-xs sharp"
                    >
                      <i className="fa fa-toggle-on"></i>
                    </Link>
                  </div>
                </td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default BootstrapTable;
