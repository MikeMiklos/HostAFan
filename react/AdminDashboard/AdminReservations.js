import React, { Fragment, useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  Chip,
  Snackbar,
  TableFooter,
  InputAdornment,
  TextField,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import SearchIcon from "@material-ui/icons/Search";

import {
  getAll,
  updateOldRes,
  getByStatus,
  searchByString,
} from "../../services/listingReservationService";
import * as lookUpService from "../../services/lookUpService";
import * as dateService from "../../services/dateService";

import ReservationDisplay from "./ReservationDisplay.jsx";
import MenuPopup from "./MenuPopup";
import ResSelectDropdown from "./ResSelectDropdown";
import StyleTable from "./StyleTableReservations";

function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [mappedRes, setMappedRes] = useState([]);
  const [selectedRes, setSelectedRes] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [statusArr, setStatusArr] = useState([]);
  const [search, setSearch] = useState({
    searchField: "",
    searching: "",
    menuItem: "",
    isStatusDefault: true,
  });
  const [pageInfo, setPageInfo] = useState({
    pageIndex: 0,
    pageSize: 4,
    totalCount: 0,
    totalPages: 0,
  });
  const [closeoutDialogOpen, setCloseoutDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    display: false,
    severity: null,
    message: "",
  });

  const selectedStyle = {
    backgroundColor: "rgba(61, 73, 119, 0.25)",
  };

  useEffect(() => {
    getResInfo(pageInfo.pageIndex, pageInfo.pageSize);
    let payload = ["StatusTypes", "Roles"];
    lookUpService.getLookUpTables(payload).then(populateLookUps);
  }, []);

  useEffect(() => {
    if (reservations) {
      setMappedRes(reservations.map(mapReservation));
    } else {
      setMappedRes([]);
    }
  }, [reservations]);

  useEffect(() => {
    getResInfo(pageInfo.pageIndex, pageInfo.pageSize);
  }, [search]);

  useEffect(() => {
    if (reservations) {
      setMappedRes(reservations.map(mapReservation));
    } else {
      setMappedRes([]);
    }
  }, [selectedRes, statusArr]);

  const populateLookUps = (response) => {
    const newStatusOptions = response.item.statusTypes.map((item) => item.name);
    newStatusOptions.unshift("Status");
    let newStatusArr = response.item.statusTypes;
    setStatusOptions(newStatusOptions);
    setStatusArr(newStatusArr);
  };

  const getResInfo = (idx, pgSize) => {
    if (search.searchField) {
      searchByString(search.searchField, idx, pgSize)
        .then(onGetResSuccess)
        .catch(onGetResError);
    } else if (search.searching === "Status") {
      const statusId = statusOptions.indexOf(search.menuItem);
      getByStatus(statusId, idx, pgSize)
        .then(onGetResSuccess)
        .catch(onGetResError);
    } else {
      getAll(idx, pgSize).then(onGetResSuccess).catch(onGetResError);
    }
  };

  const onGetResSuccess = (response) => {
    const pageIndex = response.item.pageIndex;
    const pageSize = response.item.pageSize;
    const totalCount = response.item.totalCount;
    const totalPages = response.item.totalPages;

    setSelectedRes([]);
    setReservations(response.item.pagedItems);

    if (
      pageIndex !== pageInfo.pageIndex ||
      pageSize !== pageInfo.pageSize ||
      totalCount !== pageInfo.totalCount ||
      totalPages !== pageInfo.totalPages
    ) {
      setPageInfo(() => {
        return {
          pageIndex,
          pageSize,
          totalCount,
          totalPages,
        };
      });
    }
  };

  const mapReservation = (res) => {
    let idx = selectedRes.indexOf(res.id);
    let isSelected = false;
    if (idx !== -1) {
      isSelected = true;
    }
    let statusLabel = "Unknown";
    if (statusArr.length > 0) {
      statusLabel = statusArr.find((status) => status.id === res.statusId).name;
      if (statusLabel === "Inactive") {
        statusLabel = "Complete";
      }
    }

    return (
      <tr key={`res_${res.id}`} style={isSelected ? selectedStyle : null}>
        <ReservationDisplay
          reservation={res}
          user={res.createdBy}
          selectRes={selectRes}
          isSelected={isSelected}
          statusLabel={statusLabel}
        />
      </tr>
    );
  };

  const onGetResError = (error) => {
    _logger("Error getting reservations:  ", error);
    setReservations([]);
  };

  const requestMenuItem = (menuSelection, type, isDefaultMenu) => {
    if (isDefaultMenu) {
      resetFromMenuPick();
    } else {
      updateMenuItem(type, menuSelection);
    }
  };

  const updateMenuItem = (filterType, selectedMenuItem) => {
    setSearch(() => {
      return {
        searchField: "",
        searching: filterType,
        menuItem: selectedMenuItem,
        isStatusDefault: false,
      };
    });
    setPageInfo((prevState) => {
      return {
        ...prevState,
        pageIndex: 0,
        totalCount: 0,
        totalPages: 0,
      };
    });
  };

  const resetFromMenuPick = () => {
    setSearch(() => {
      return {
        searchField: "",
        searching: "",
        menuItem: "",
        isStatusDefault: true,
      };
    });
  };

  const onSearchFieldChange = (e) => {
    const searchString = e.currentTarget.value;
    if (search.searching) {
      // If current search criteria is based on reservation status...change search state to reflect a search field search
      setSearch((prevState) => {
        return {
          ...prevState,
          searchField: searchString,
          searching: "",
          menuItem: "",
          isStatusDefault: true,
        };
      });
      setPageInfo((prevState) => {
        return {
          ...prevState,
          pageIndex: 0,
          totalCount: 0,
          totalPages: 0,
        };
      });
    } else if (searchString === "") {
      setSearch(() => {
        return {
          searchField: "",
          searching: "",
          menuItem: "",
          isStatusDefault: true,
        };
      });
    } else {
      // Update the search field in state
      setSearch((prevState) => {
        return {
          ...prevState,
          searchField: searchString,
        };
      });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPageInfo((prevState) => {
      return {
        ...prevState,
        pageIndex: newPage,
      };
    });
    getResInfo(newPage, pageInfo.pageSize);
  };

  const handleChangeRowsPerPage = (event) => {
    const rowsPerPg = parseInt(event.target.value, 10);
    setPageInfo((prevState) => {
      return {
        ...prevState,
        pageIndex: 0,
        pageSize: rowsPerPg,
      };
    });

    getResInfo(0, rowsPerPg);
  };

  const selectRes = (id) => {
    setSelectedRes((prevState) => {
      let selectedRes = [...prevState];
      let resIdx = selectedRes.indexOf(id);
      if (resIdx === -1) {
        selectedRes.push(id);
      } else {
        selectedRes.splice(resIdx, 1);
      }
      return selectedRes;
    });
  };

  const selectAllOldRes = () => {
    const newSelected = reservations
      .filter(filterResByDateAndStatus)
      .map((res) => res.id);
    setSelectedRes(newSelected);
  };

  const selectAllRes = () => {
    const newSelected = reservations.map((res) => res.id);
    setSelectedRes(newSelected);
  };

  const deselectAllRes = () => {
    setSelectedRes([]);
  };

  const filterResByDateAndStatus = (res) => {
    const checkOutDateDiff = dateService.getDayDiff(
      new Date(Date.now()),
      res.dateCheckOut
    );
    return checkOutDateDiff < 0 && res.statusId === 1;
  };

  const closeOutRes = () => {
    setCloseoutDialogOpen(true);
  };

  const toggleDialog = () => {
    setCloseoutDialogOpen(!closeoutDialogOpen);
  };

  const confirmCloseRes = () => {
    if (selectedRes.length > 0) {
      _logger("Close out selected res: ", selectedRes);
      updateOldRes(selectedRes)
        .then(onUpdateOldResSuccess)
        .catch(onUpdateOldResError);
    } else {
      updateOldRes([]).then(onUpdateOldResSuccess).catch(onUpdateOldResError);
    }
  };

  const onUpdateOldResSuccess = (response) => {
    toggleDialog();
    if (response.items !== null) {
      setSnackbar(() => {
        return {
          display: true,
          severity: "success",
          message: "Old reservations successfully closed out.",
        };
      });
      let newRes = [...reservations];
      response.items.forEach((resInfo) => {
        _logger(
          `Closeout success for res#${resInfo.reservationId}. Emails sent to '${resInfo.fanEmail}' and '${resInfo.hostEmail}'`
        );
        const resIndex = reservations.findIndex(
          (res) => res.id === resInfo.reservationId
        );
        // Check to see if the reservation is in the current admin table view....
        if (resIndex !== -1) {
          newRes[resIndex].statusId = 2;
        }
      });
      setReservations(() => {
        return newRes;
      });
    } else {
      setSnackbar(() => {
        return {
          display: true,
          severity: "error",
          message: "No reservations closed out.",
        };
      });
    }
    setSelectedRes([]);
  };

  const onUpdateOldResError = (error) => {
    toggleDialog();
    _logger("Error closing out old reservations: ", error);
    setSnackbar(() => {
      return {
        display: true,
        severity: "error",
        message: "Error closing out old reservations.",
      };
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(() => {
      return {
        display: false,
        severity: "info",
        message: "",
      };
    });
  };

  return (
    <Fragment>
      <Card className="card-box mb-4">
        <div className="card-header pr-2">
          <div className="card-header--title font-size-lg font-weight-bolder">
            Manage Reservations
          </div>
          <div className="card-header--actions p-2">
            <TextField
              margin="dense"
              label="Search"
              type="search"
              variant="outlined"
              style={{ width: 375 }}
              value={search.searchField}
              onChange={onSearchFieldChange}
              placeholder="Search by fan/host name, or keyword..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </div>
        </div>
        <CardContent className="p-3">
          <TableContainer className="table table-borderless table-hover text-nowrap mb-0">
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <tr>
                  <th className="text-center align-middle">Res #</th>
                  <th className="text-left align-middle">Start Date</th>
                  <th className="text-left align-middle">End Date</th>
                  <th className="text-left align-middle">
                    <MenuPopup
                      type={"Status"}
                      isDefault={search.isStatusDefault}
                      options={statusOptions}
                      reqFunc={requestMenuItem}
                    ></MenuPopup>
                  </th>
                  <th className="text-left align-middle">Created By (Fan)</th>
                  <th className="text-center align-middle">Details</th>
                  <th className="text-right align-middle">
                    <ResSelectDropdown
                      type={"Select"}
                      selectAllOldRes={selectAllOldRes}
                      selectAllRes={selectAllRes}
                      deselectAllRes={deselectAllRes}
                    ></ResSelectDropdown>
                  </th>
                </tr>
              </TableHead>
              <TableBody>
                {pageInfo.totalCount ? (
                  mappedRes
                ) : (
                  <tr
                    className="text-left text-bold text-white "
                    style={{ background: StyleTable.roleChipColor[1] }}
                  >
                    <td colSpan="7">No reservations found.</td>
                  </tr>
                )}
              </TableBody>
              <TableFooter>
                {pageInfo.totalCount ? (
                  <TableRow>
                    <td colSpan="7" className="text-right">
                      <Chip
                        color={"primary"}
                        style={{
                          backgroundColor: "#4caf50",
                        }}
                        label={
                          selectedRes.length > 0
                            ? "Close Out Selected Res"
                            : "Close Out ALL Old Res"
                        }
                        clickable
                        onClick={closeOutRes}
                      />
                    </td>
                  </TableRow>
                ) : null}
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[4, 8, 16, 32]}
                    colSpan={7}
                    count={pageInfo.totalCount}
                    rowsPerPage={pageInfo.pageSize}
                    page={pageInfo.pageIndex}
                    SelectProps={{
                      inputProps: { "aria-label": "rows per page" },
                      native: true,
                    }}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      <Dialog
        open={closeoutDialogOpen}
        onClose={toggleDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        classes={{ paper: "modal-dark bg-plum-plate" }}
      >
        <DialogTitle id="alert-dialog-title" className="text-center">
          Warning
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            className="text-white"
          >
            Are you sure you want to close out old reservations?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={toggleDialog}
            color="primary"
            className="bg-strong-bliss text-white"
            autoFocus
          >
            No
          </Button>
          <Button
            onClick={confirmCloseRes}
            color="primary"
            className="bg-warning text-white ml-auto"
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackbar.display}
        onClose={handleCloseSnackbar}
        autoHideDuration={6000}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Fragment>
  );
}

export default AdminReservations;
