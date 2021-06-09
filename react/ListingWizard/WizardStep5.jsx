import React, { Fragment, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { withFormik } from "formik";
import PropTypes from "prop-types";
import * as dateService from "../../services/dateService";
import * as eventService from "../../services/eventService";

import { Card, CardHeader, Divider, Grid, Button } from "@material-ui/core";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ProfileMap from "./ProfileMap";

const WizardStep5 = (props) => {
  const { values, handleSubmit, nextLabel, onBack } = props;
  const [event, setEvent] = useState({
    id: 0,
    eventType: {
      name: "",
      id: 0,
    },
    eventCategory: {
      name: "",
      id: 0,
    },
    name: "",
    summary: "",
    shortDescription: "",
    venue: {
      id: 0,
      name: "",
      description: "",
      location: {
        id: 0,
        locationType: {
          name: "",
          id: 0,
        },
        lineOne: "",
        city: "",
        zip: "",
        state: {
          code: "",
          name: "",
          id: 0,
        },
        latitude: 0,
        longitude: 0,
      },
      url: "",
      isDeleted: false,
      imageUrl: "",
    },
    eventStatus: {
      name: "",
      id: 0,
    },
    imageUrl: "",
    externalId: 0,
    isFree: false,
    dateStart: "",
    dateEnd: "",
  });
  const [property, setProperty] = useState(null);
  const [parkingSpot, setParkingSpot] = useState(null);
  // const [profileName, setProfileName] = useState("");
  const history = useHistory();

  useEffect(() => {
    // Set Loki state to show final step "completed"
    props.completeFinalStep();
    eventService
      .getDetailsById(values.eventId)
      .then(onGetEventDetailsSuccess)
      .catch(onGetEventDetailsError);

    switch (values.serviceTypeId) {
      case 1:
        const currentProperty = props.hostProfiles.find(
          (prop) => prop.id === values.serviceProfileId
        );
        setProperty(currentProperty);
        // _logger("listing: ", property);
        break;
      case 3:
        const currentSpot = props.hostParkingProfiles.find(
          (spot) => spot.id === values.parkingProfileId
        );
        setParkingSpot(currentSpot);
        // _logger("Parking spot: ", currentSpot);
        break;
    }
  }, []);

  const onGetEventDetailsSuccess = (response) => {
    // _logger("Success getting event details: ", response);
    setEvent(response.item);
  };

  const onGetEventDetailsError = (error) => {
    _logger("Error getting event details: ", error);
  };

  const getDaysAvail = () => {
    let daysAvail = null;
    if (values.serviceTypeId === 1 || values.serviceTypeId === 3) {
      let daysOffered = 1;
      const dayDiff = dateService.getDayDiff(
        values.availabilityStart,
        values.availabilityEnd
      );
      const difference = Math.round(dayDiff);
      if (difference > 1) {
        daysOffered = difference;
      }
      daysAvail = (
        <li className="ml-4 px-4 pb-2">Days Available: {daysOffered}</li>
      );
    }
    return daysAvail;
  };

  const getTitle = () => {
    let title;
    switch (values.serviceTypeId) {
      case 1:
        title = (
          <strong className="font-weight-bold d-block mt-2 mb-1">
            <span>
              <FontAwesomeIcon
                icon={["fas", "home"]}
                className="text-success font-size-xl mr-2"
              />
              {values.title} (Stay)
            </span>
          </strong>
        );
        break;
      case 3:
        title = (
          <strong className="font-weight-bold d-block mt-2 mb-1">
            <span>
              <FontAwesomeIcon
                icon={["fas", "parking"]}
                className="text-success font-size-lg mr-2"
              />
              {values.title} (Parking)
            </span>
          </strong>
        );
        break;
      case 4:
        title = (
          <strong className="font-weight-bold d-block mt-2 mb-1">
            <span>
              <FontAwesomeIcon
                icon={["fas", "people-arrows"]}
                className="text-success font-size-lg mr-2"
              />
              {values.title} (Hosted Event)
            </span>
          </strong>
        );
        break;
      default:
        title = null;
    }
    return title;
  };

  const getDates = () => {
    let formattedDate;
    switch (values.serviceTypeId) {
      case 1:
        formattedDate = (
          <Fragment>
            {dateService.formatDate(values.availabilityStart)} -{" "}
            {dateService.formatDate(values.availabilityEnd)}
          </Fragment>
        );
        break;
      case 3:
        formattedDate = (
          <Fragment>
            {dateService.formatDate(values.availabilityStart)} -{" "}
            {dateService.formatDate(values.availabilityEnd)}
          </Fragment>
        );
        break;
      case 4:
        if (values.hostEventEndTime === "") {
          formattedDate = `${dateService.formatDateTime(
            values.hostEventStartTime
          )}`;
        } else {
          formattedDate = (
            <Fragment>
              {dateService.formatDateTime(values.hostEventStartTime)} -{" "}
              {dateService.formatDateTime(values.hostEventEndTime)}
            </Fragment>
          );
        }
        break;
      default:
        formattedDate = null;
    }
    return formattedDate;
  };

  const getCost = () => {
    let cost;
    switch (values.serviceTypeId) {
      case 1:
        cost = (
          <li className="px-4 py-2">
            <FontAwesomeIcon
              icon={["fas", "dollar-sign"]}
              className="text-success font-size-lg mr-2"
            />
            ${values.costPerNight} / night
          </li>
        );
        break;
      case 3:
        cost = (
          <li className="px-4 py-2">
            <FontAwesomeIcon
              icon={["fas", "dollar-sign"]}
              className="text-success font-size-lg mr-2"
            />
            ${values.costPerNight} / day
          </li>
        );
        break;
      case 4:
        cost = (
          <li className="px-4 py-2">
            <FontAwesomeIcon
              icon={["fas", "dollar-sign"]}
              className="text-success font-size-lg mr-2"
            />
            Free
          </li>
        );
        break;
      default:
        cost = null;
    }
    return cost;
  };

  const getAmenities = () => {
    let formattedAmenities = null;
    if (values.serviceTypeId === 1) {
      formattedAmenities = values.amenities.map((amenity) => {
        if (amenity.name !== "") {
          return (
            <li key={`amenity_${amenity.name}`} className="px-2 pb-2">
              <FontAwesomeIcon
                icon={["fas", "tv"]}
                className="text-success font-size-md mr-2"
              />
              {amenity.name}
            </li>
          );
        }
      });
    }
    return formattedAmenities;
  };

  const getProfileDetails = () => {
    let profileDetails = null;
    switch (values.serviceTypeId) {
      case 1:
        if (property) {
          profileDetails = (
            <Fragment>
              <FontAwesomeIcon
                icon={["fas", "home"]}
                className="text-success font-size-xxl mr-2"
              />
              <div className="font-size-lg py-2">
                {`${property.internalName} (${property.housingType.name})`}
              </div>
              <div className="font-weight-light">
                {property.location.lineOne}
              </div>
              {property.location.lineTwo !== "" && (
                <div className="font-weight-light">
                  {property.location.lineTwo}
                </div>
              )}
              <div className="font-weight-light">
                {`${property.location.city}, ${property.location.state.code} ${property.location.zip}`}
              </div>
              <div className="py-2 font-weight-light">
                {property.hostDescription}
              </div>
              <ul className="list-unstyled text-left my-2 font-weight-bold">
                <li className="px-2 pb-2">
                  <FontAwesomeIcon
                    icon={["fas", "users"]}
                    className="text-success font-size-lg mr-2"
                  />
                  {`Guests: ${property.guestCapacity}`}
                </li>
                <li className="px-2 pb-2">
                  <FontAwesomeIcon
                    icon={["fas", "bed"]}
                    className="text-success font-size-lg mr-2"
                  />
                  {`Bedrooms: ${property.bedRooms}`}
                </li>
                <li className="px-2 pb-2">
                  <FontAwesomeIcon
                    icon={["fas", "shower"]}
                    className="text-success font-size-lg mr-2"
                  />
                  {`Bathrooms: ${property.baths}`}
                </li>
                {getAmenities()}
              </ul>
            </Fragment>
          );
        }
        break;
      case 3:
        if (parkingSpot) {
          profileDetails = (
            <Fragment>
              <FontAwesomeIcon
                icon={["fas", "parking"]}
                className="text-success font-size-xxl mr-2"
              />
              <div className="font-size-lg py-2">
                {`${parkingSpot.parkingType.name} (${parkingSpot.status.name})`}
              </div>
              <div className="font-weight-light">
                {parkingSpot.location.lineOne}
              </div>
              <div className="font-weight-light">
                {`${parkingSpot.location.city}, ${parkingSpot.location.state.code} ${parkingSpot.location.zip}`}
              </div>
              <div className="py-2 font-weight-light">
                {parkingSpot.description}
              </div>
            </Fragment>
          );
        }
        break;
    }
    return profileDetails;
  };

  const getLocationForMap = () => {
    switch (values.serviceTypeId) {
      case 1:
        const property = props.hostProfiles.find(
          (prop) => prop.id === values.serviceProfileId
        );
        return property.location;
        break;
      case 3:
        const parkingSpot = props.hostParkingProfiles.find(
          (prop) => prop.id === values.parkingProfileId
        );
        return parkingSpot.location;
        break;
      default:
        return null;
    }
  };

  const backClicked = () => {
    onBack(values);
  };

  const redirectToDashboard = () => {
    history.push("/dashboard/host");
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-4 mb-4">
        <CardHeader
          title="Listing Preview"
          className="bg-amy-crisp text-white"
          titleTypographyProps={{ variant: "h3" }}
        />
        <Divider className="my-4" />
        <Card className="mx-4 mb-4 shadow-lg p-3 text-white bg-plum-plate w-75">
          <div className="">
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                {" "}
                {/*The left half of the card is the Listing Details */}
                <h5 className="font-size-xl">
                  {getTitle()}
                  <div className="font-size-lg opacity-7 mt-3 mb-1">
                    Short Description:{" "}
                  </div>
                  <div className="font-size-md opacity-5">
                    {values.shortDescription}
                  </div>
                  <div className="font-size-lg opacity-7 mt-3 mb-1">
                    Description:{" "}
                  </div>
                  <div className="font-size-md opacity-5">
                    {values.description}
                  </div>
                </h5>
                <ul className="list-unstyled text-left my-4 font-weight-bold">
                  <li className="px-4 pb-2">
                    <FontAwesomeIcon
                      icon={["far", "calendar"]}
                      className="text-success font-size-lg mr-2"
                    />
                    {getDates()}
                  </li>
                  {getDaysAvail()}
                  {getCost()}
                  {values.serviceTypeId === 1 && values.rideshareId !== 0 && (
                    <li className="px-4 py-2">
                      <FontAwesomeIcon
                        icon={["fas", "car"]}
                        className="text-success font-size-lg mr-2"
                      />
                      Rideshare: ${values.rideshareCost}
                    </li>
                  )}
                  {values.serviceTypeId === 4 && (
                    <li className="px-4 py-2">
                      <FontAwesomeIcon
                        icon={["fas", "users"]}
                        className="text-success font-size-lg mr-2"
                      />
                      {`Max Capacity: ${
                        values.hostEventMaxCapacity !== 0
                          ? values.hostEventMaxCapacity
                          : "N/A"
                      }`}
                    </li>
                  )}
                </ul>
                <Divider className="my-4" />
                <Grid container spacing={1}>
                  {/* On the left side, lower half, the top is profile details */}
                  <Grid item xs={12} lg={6}>
                    {getProfileDetails()}
                  </Grid>
                  {/* On the left side, lower half, the bottom is a map of the profile (property or parking spot) */}
                  {values.serviceTypeId === 1 || values.serviceTypeId === 3 ? (
                    <Grid
                      item
                      xs={12}
                      lg={6}
                      className="align-items-center w-75"
                    >
                      <ProfileMap
                        serviceTypeId={values.serviceTypeId}
                        profileName={
                          property
                            ? property.internalName
                            : parkingSpot
                            ? parkingSpot.parkingType.name
                            : ""
                        }
                        venueName={event.venue.name}
                        location={getLocationForMap()}
                        venueLoc={event.venue.location}
                      />
                    </Grid>
                  ) : null}
                </Grid>
              </Grid>
              <Grid item xs={12} md={6}>
                {" "}
                {/*The right half of the card is the Event Details */}
                {event.id !== 0 && (
                  <Grid container spacing={1}>
                    <Grid
                      item
                      xs={12}
                      lg={12}
                      className="d-flex align-items-center"
                    >
                      <Card className="card-box flex-fill mb-4 mb-xl-0 w-75">
                        <a
                          className="card-img-wrapper rounded"
                          href={event.venue.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            style={{
                              height: "100%",
                              width: "100%",
                            }}
                            src={event.imageUrl}
                          ></img>
                        </a>
                      </Card>
                    </Grid>
                    <Grid item xs={12} lg={12}>
                      <div className="py-0 py-xl-5">
                        <div className="pl-0 pl-xl-5 text-white">
                          <h5 className="font-size-xl">
                            <strong className="font-weight-bold d-block mt-2 mb-1">
                              {event.name}
                            </strong>
                          </h5>
                          {event.summary !== event.name ? (
                            <div
                              className="font-size-xl font-weight-light"
                              name="summary"
                            >
                              {event.summary}
                            </div>
                          ) : null}
                          <div
                            className="font-size-m font-weight-light"
                            name="shortDescription"
                            style={{ marginTop: "20px" }}
                          >
                            {event.shortDescription}
                          </div>
                          <div className="d-block mt-4">
                            <div className="feature-box pr-4">
                              <h3 className="font-size-lg font-weight-bold mt-3">
                                <a className="text-white"></a>
                                Event Date
                              </h3>
                              <div className="font-weight-light mb-3">
                                {dateService.formatDateTime(event.dateStart)}
                              </div>
                            </div>
                            <div>
                              <div className="feature-box pr-4">
                                <h3 className="font-size-lg font-weight-bold my-3">
                                  <a
                                    href={event.venue.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white"
                                  >
                                    {event.venue.name}
                                  </a>
                                </h3>
                                {event.venue.description !==
                                event.venue.name ? (
                                  <div className="font-weight-light mb-3">
                                    {event.venue.description}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                            <div>
                              <div className="feature-box pr-4">
                                <div className="font-size-lg mt-3">Address</div>
                                <div className="font-weight-light mb-3">
                                  {event.venue.location.lineOne},
                                  <div>
                                    {event.venue.location.city},
                                    {event.venue.location.state.name}
                                  </div>
                                  <div>{event.venue.location.zip}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </div>
        </Card>
        <Button
          type="button"
          className="mx-4"
          color="secondary"
          variant="contained"
          onClick={backClicked}
        >
          Back
        </Button>
        <Button type="submit" color="primary" variant="contained">
          {nextLabel}
        </Button>
        {props.addUpdateSuccess && (
          <Button
            variant="contained"
            color="primary"
            className="bg-strong-bliss text-white ml-4"
            onClick={redirectToDashboard}
          >
            Back to Dashboard
          </Button>
        )}
      </Card>
    </form>
  );
};

WizardStep5.propTypes = {
  values: PropTypes.shape({
    title: PropTypes.string.isRequired,
    serviceTypeId: PropTypes.number.isRequired,
    serviceProfileId: PropTypes.number.isRequired,
    parkingProfileId: PropTypes.number.isRequired,
    hostEventProfileId: PropTypes.number.isRequired,
    availabilityStart: PropTypes.string.isRequired,
    availabilityEnd: PropTypes.string.isRequired,
    costPerNight: PropTypes.number.isRequired,
    hostEventStartTime: PropTypes.string.isRequired,
    hostEventEndTime: PropTypes.string.isRequired,
    hostEventMaxCapacity: PropTypes.number.isRequired,
    eventId: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    shortDescription: PropTypes.string.isRequired,
    amenities: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
    additionalServices: PropTypes.bool.isRequired,
    rideshareId: PropTypes.number.isRequired,
    rideshareCost: PropTypes.number.isRequired,
    listingImages: PropTypes.arrayOf(PropTypes.shape({})),
  }),
  handleChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  nextLabel: PropTypes.string,
  onBack: PropTypes.func,
  completeFinalStep: PropTypes.func.isRequired,
  hostProfiles: PropTypes.arrayOf(PropTypes.shape({})),
  hostParkingProfiles: PropTypes.arrayOf(PropTypes.shape({})),
  addUpdateSuccess: PropTypes.bool.isRequired,
};

export default withFormik({
  mapPropsToValues: (props) => ({
    title: props.formData.title,
    serviceTypeId: parseInt(props.formData.serviceTypeId),
    serviceProfileId: props.formData.serviceProfileId,
    parkingProfileId: props.formData.parkingProfileId,
    hostEventProfileId: props.formData.hostEventProfileId,
    availabilityStart: props.formData.availabilityStart,
    availabilityEnd: props.formData.availabilityEnd,
    costPerNight: props.formData.costPerNight,
    hostEventStartTime: props.formData.hostEventStartTime,
    hostEventEndTime: props.formData.hostEventEndTime,
    hostEventMaxCapacity: props.formData.hostEventMaxCapacity,
    eventId: props.formData.eventId,
    description: props.formData.description,
    shortDescription: props.formData.shortDescription,
    amenities: props.formData.amenities,
    additionalServices: props.formData.additionalServices,
    rideshareId: props.formData.rideshareId,
    rideshareCost: props.formData.rideshareCost,
    listingImages: props.formData.listingImages,
  }),

  enableReinitialize: true,

  validateOnMount: true,

  handleSubmit: (values, { props }) => {
    props.onNext(values);
  },
})(WizardStep5);
