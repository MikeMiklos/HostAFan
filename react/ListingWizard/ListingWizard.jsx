import React, { Fragment, useEffect, useState } from "react";
import Loki from "../components/forms/Loki";
import WizardStep1 from "../components/forms/WizardStep1";
import WizardStep2 from "../components/forms/WizardStep2";
import WizardStep3 from "../components/forms/WizardStep3";
import WizardStep4 from "../components/forms/WizardStep4";
import WizardStep5 from "../components/forms/WizardStep5";
import * as listingService from "../services/listingService";
import * as parkingService from "../services/parkingService";
import * as hostProfileService from "../services/hostProfileService";

import { useParams, useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkedAlt,
  faTv,
  faCar,
  faHome,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import "../components/forms/LokiStyling.css";
import { Snackbar, MenuItem } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

import logger from "sabio-debug";
const _logger = logger.extend("ListingWizard");

const ListingWizard = () => {
  const history = useHistory();
  const params = useParams();
  const [hostProfiles, setHostProfiles] = useState([]);
  const [hostProfilesMapped, setHostProfilesMapped] = useState([]);
  const [hostParkingProfiles, setHostParkingProfiles] = useState([]);
  const [hostParkingProfilesMapped, setHostParkingProfilesMapped] = useState(
    []
  );
  const [finalStepComplete, setFinalStepComplete] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    serviceTypeId: 0,
    serviceProfileId: 0,
    parkingProfileId: 0,
    hostEventProfileId: 0,
    availabilityStart: "",
    availabilityEnd: "",
    costPerNight: 0,
    hostEventStartTime: "",
    hostEventEndTime: "",
    hostEventMaxCapacity: 0,
    eventId: 0,
    description: "",
    shortDescription: "",
    amenities: [{ name: "" }],
    additionalServices: false,
    rideshareId: 0,
    rideshareCost: 0,
    listingImages: [],
  });
  const [snackbarState, setSnackbarState] = useState({
    display: false,
    severity: null,
    message: "",
    startOver: false,
  });
  const [addUpdateSuccess, setAddUpdateSuccess] = useState(false);

  useEffect(() => {
    if (params.hasOwnProperty("id")) {
      listingService
        .getListingById(params.id)
        .then(onGetListingSuccess)
        .catch(onGetListingError);
    } else {
      _logger("No routing parameter => create a new listing");
    }

    hostProfileService
      .getCreatedBy()
      .then(onGetHostProfilesSuccess)
      .catch(onGetHostProfilesError);

    parkingService
      .getCreatedBy()
      .then(onGetParkingProfilesSuccess)
      .catch(onGetParkingProfilesError);
  }, []);

  const onGetListingSuccess = (response) => {
    const listing = response.item.listing;
    // _logger("Got listing:  ", listing);

    if (listing.hasReservation) {
      // Host cannot edit a listing that has a reservation...
      history.push("/listingForm");
    } else {
      setFinalStepComplete(true);

      let startDate = formatDate(listing.availabilityStart);
      let endDate = formatDate(listing.availabilityEnd);
      let hostStart = formatDateTime(listing.listingProfile.StartTime);
      let hostEnd = formatDateTime(listing.listingProfile.EndTime);

      const newFormData = {
        title: listing.title,
        serviceTypeId: listing.serviceType.id,
        serviceProfileId:
          listing.serviceType.id === 1 ? listing.serviceProfileId : 0,
        parkingProfileId:
          listing.serviceType.id === 3 ? listing.serviceProfileId : 0,
        hostEventProfileId:
          listing.serviceType.id === 4 ? listing.serviceProfileId : 0,
        availabilityStart:
          listing.serviceType.id === 1 || listing.serviceType.id === 3
            ? startDate
            : "",
        availabilityEnd:
          listing.serviceType.id === 1 || listing.serviceType.id === 3
            ? endDate
            : "",
        costPerNight: listing.costPerNight ? listing.costPerNight : 0,
        hostEventStartTime: hostStart,
        hostEventEndTime: hostEnd,
        hostEventMaxCapacity:
          listing.serviceType.id === 4 ? listing.listingProfile.MaxCapactiy : 0,
        eventId: listing.event.id,
        description: listing.description,
        shortDescription: listing.shortDescription,
        additionalServices: listing.additionalServices,
        amenities: [{ name: "" }],
        rideshareId: 0,
        rideshareCost: 0,
        listingImages: [],
      };

      if (listing.amenities) {
        newFormData.amenities = listing.amenities;
      }

      let rideshareInfo;
      if (listing.services) {
        rideshareInfo = listing.services.find(
          (service) => service.serviceTypeId === 2
        );
      }
      if (rideshareInfo !== undefined) {
        newFormData.rideshareId = rideshareInfo.serviceProfileId;
        newFormData.rideshareCost = rideshareInfo.cost;
      }
      setFormData(newFormData);
    }
  };

  const formatDate = (date) => {
    if (date !== "") {
      let workingDate = date;
      workingDate = new Date(date);
      let wMonth = workingDate.getMonth();
      let wDay = workingDate.getDate();
      if (parseInt(wMonth) < 10) {
        wMonth = `0${wMonth}`;
      }
      if (parseInt(wDay) < 10) {
        wDay = `0${wDay}`;
      }

      workingDate = `${workingDate.getFullYear()}-${wMonth}-${wDay}`;
      return workingDate;
    } else {
      return "";
    }
  };

  const formatDateTime = (date) => {
    if (date !== undefined) {
      let workingDate = date;
      workingDate = new Date(date);
      let wMonth = workingDate.getMonth();
      let wDay = workingDate.getDate();
      let wHour = workingDate.getHours();
      let wMin = workingDate.getMinutes();

      if (parseInt(wMonth) < 10) {
        wMonth = `0${wMonth}`;
      }

      if (parseInt(wDay) < 10) {
        wDay = `0${wDay}`;
      }

      if (parseInt(wHour) < 10) {
        wHour = `0${wHour}`;
      }

      if (parseInt(wMin) < 10) {
        wMin = `0${wMin}`;
      }

      workingDate = `${workingDate.getFullYear()}-${wMonth}-${wDay}T${wHour}:${wMin}`;
      return workingDate;
    } else {
      return "";
    }
  };

  const onGetListingError = (error) => {
    _logger("Error retrieving listing:  ", error);
    setSnackbarState({
      display: true,
      severity: "error",
      message: "Oops, could not retrieve listing.",
      startOver: true,
    });
  };

  const mapHostProfiles = (profile) => {
    return (
      <MenuItem key={profile.id} value={profile.id}>
        {`${profile.housingType.name} on ${profile.location.lineOne}, ${profile.location.city}, ${profile.location.state.code} for
        ${profile.guestCapacity} guests`}
      </MenuItem>
    );
  };

  const mapParkingProfiles = (profile) => {
    return (
      <MenuItem key={profile.id} value={profile.id}>
        {`${profile.location.lineOne}, ${profile.location.city}, ${profile.location.state.code} - ${profile.parkingType.name} (${profile.status.name})`}
      </MenuItem>
    );
  };

  const onGetHostProfilesSuccess = (res) => {
    // _logger("Got host profiles: ", res);
    setHostProfiles(res.items);
    setHostProfilesMapped(res.items.map(mapHostProfiles));
  };

  const onGetHostProfilesError = (err) => {
    _logger("Error getting host profiles: ", err);
  };

  const onGetParkingProfilesSuccess = (res) => {
    // _logger("Got parking profiles: ", res);
    setHostParkingProfiles(
      res.items.filter((profile) => profile.status.id === 1)
    );
    setHostParkingProfilesMapped(
      res.items
        .filter((profile) => profile.status.id === 1)
        .map(mapParkingProfiles)
    );
  };

  const onGetParkingProfilesError = (err) => {
    _logger("Error getting parking profiles: ", err);
  };

  const onFinish = (values) => {
    // _logger("Starting onFinish....");
    setFormData(values);
    let inputData = { ...values };
    inputData.amenities = inputData.amenities
      .map((amenity) => amenity.name)
      .filter(Boolean);
    inputData.isActive = true;

    if (inputData.serviceTypeId !== 1 || inputData.rideshareId === 0) {
      inputData.additionalServices = false;
    }

    if (inputData.serviceTypeId === 1 || inputData.serviceTypeId === 3) {
      // If Stay or Parking
      inputData.availabilityStart = formatDateToISOString(
        inputData.availabilityStart
      );
      inputData.availabilityEnd = formatDateToISOString(
        inputData.availabilityEnd
      );
      inputData.hostEventStartTime = null;
      inputData.hostEventEndTime = null;

      if (inputData.serviceTypeId === 3) {
        inputData.serviceProfileId = values.parkingProfileId;
      }
    } else if (inputData.serviceTypeId === 4) {
      // If Hosted Event
      inputData.serviceProfileId = values.hostEventProfileId;
      inputData.availabilityStart = null;
      inputData.availabilityEnd = null;
      inputData.costPerNight = 0;
      inputData.hostEventStartTime = formatDateToISOString(
        inputData.hostEventStartTime
      );
      inputData.hostEventEndTime = formatDateToISOString(
        inputData.hostEventEndTime
      );
    }

    if (params.hasOwnProperty("id")) {
      _logger(`Update listing ${params.id}`);
      inputData.id = parseInt(params.id);
      listingService
        .updateListing(inputData)
        .then(onUpdateListingSuccess)
        .catch(onCreateListingError);
    } else {
      _logger(`Create new listing.`);
      listingService
        .createListing(inputData)
        .then(onCreateListingSuccess)
        .catch(onCreateListingError);
    }
  };

  const formatDateToISOString = (dateToFormat) => {
    if (dateToFormat !== "") {
      let formattedDate = new Date(dateToFormat);
      formattedDate = formattedDate.toISOString();
      return formattedDate;
    } else {
      return null;
    }
  };

  const onChange = (values) => {
    // _logger("onChange called with values: ", values);
    setFormData(values);
  };

  const handleCloseSnackbar = () => {
    let startOver = snackbarState.startOver;
    setSnackbarState({
      display: false,
      severity: "info",
      message: "",
      startOver: false,
    });
    if (startOver) {
      history.push("/listingForm");
    }
  };

  const completeFinalStep = () => {
    setFinalStepComplete(true);
  };

  const wizardSteps = [
    {
      label: "Step 1",
      icon: <FontAwesomeIcon icon={faMapMarkedAlt} className="mt-3" />,
      component: (
        <WizardStep1
          formData={formData}
          onChange={onChange}
          hostProfiles={hostProfiles}
        />
      ),
      isEnabled: true,
    },
    {
      label: "Step 2",
      icon: <FontAwesomeIcon icon={faHome} className="mt-3" />,
      component: (
        <WizardStep2
          formData={formData}
          onChange={onChange}
          hostProfiles={hostProfilesMapped}
          hostParkingProfiles={hostParkingProfilesMapped}
        />
      ),
      isEnabled: true,
    },
    {
      label: "Step 3",
      icon: <FontAwesomeIcon icon={faTv} className="mt-3" />,
      component: <WizardStep3 formData={formData} onChange={onChange} />,
      isEnabled: formData.serviceTypeId === 1,
    },
    {
      label: "Step 4",
      icon: <FontAwesomeIcon icon={faCar} className="mt-3" />,
      component: <WizardStep4 formData={formData} onChange={onChange} />,
      isEnabled: formData.serviceTypeId === 1,
    },
    {
      label: "Step 5",
      icon: <FontAwesomeIcon icon={faEye} className="mt-3" />,
      component: (
        <WizardStep5
          formData={formData}
          onChange={onChange}
          completeFinalStep={completeFinalStep}
          hostProfiles={hostProfiles}
          hostParkingProfiles={hostParkingProfiles}
          addUpdateSuccess={addUpdateSuccess}
        />
      ),
      isEnabled: true,
    },
  ];

  const onCreateListingSuccess = (res) => {
    _logger("Create listing success. Listing #", res.item);
    const newFormData = { ...formData, listingId: res.item };
    setFormData(newFormData);
    setAddUpdateSuccess(true);
    setSnackbarState({
      display: true,
      severity: "success",
      message: "Listing created!",
    });
  };

  const onCreateListingError = (err) => {
    _logger(err);
    setSnackbarState({
      display: true,
      severity: "error",
      message: "Oops, something went wrong.",
    });
  };

  const onUpdateListingSuccess = (res) => {
    _logger("Update listing success. Listing #", res.item);
    setAddUpdateSuccess(true);
    setSnackbarState({
      display: true,
      severity: "success",
      message: "Listing updated!",
    });
  };

  return (
    <Fragment>
      <div className="myWizard">
        <Loki
          steps={wizardSteps}
          finalStepComplete={finalStepComplete}
          onNext={onChange}
          onBack={onChange}
          onGoTo={onChange}
          onFinish={onFinish}
          finishLabel={params.hasOwnProperty("id") ? "Finish Update" : "Finish"}
          updateMode={params.hasOwnProperty("id")}
          noActions
        />
        <Snackbar
          open={snackbarState.display}
          onClose={handleCloseSnackbar}
          autoHideDuration={6000}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbarState.severity}
          >
            {snackbarState.message}
          </Alert>
        </Snackbar>
      </div>
    </Fragment>
  );
};

export default ListingWizard;
