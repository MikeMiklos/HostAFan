import React, { Fragment } from "react";
import {
  Button,
  Divider,
  Grid,
  Card,
  MenuItem,
  TextField,
  FormControl,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import { Formik, Form } from "formik";
import * as parkingService from "../../services/parkingService";
import { getCreatedBy as getHostProfiles } from "../../services/hostProfileService";
import { getLookUpTables } from "../../services/lookUpService";
import { ParkingSchema } from "../../schemas/parkingSchema";
import PropTypes from "prop-types";
import { Autocomplete, LoadScript } from "@react-google-maps/api";
import Geocode from "react-geocode";
import { GOOGLE_API_KEY } from "../../services/serviceHelpers";
import toast from "toastr";

const libraries = ["places"];
Geocode.setApiKey(GOOGLE_API_KEY);

class Parking extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userParkingProfiles: [],
      userLocations: [],
      stateDropdownList: [],
      parkingTypeDropdownList: [],
      statusDropdownList: [],
      formData: {
        parkingId: "",
        locationId: "",
        lineOne: "",
        city: "",
        state: "",
        zip: "",
        parkingType: "",
        isPrivate: true,
        status: "",
        description: "",
        latitude: 0,
        longitude: 0,
      },
    };
    this.autocomplete = null;
  }

  componentDidMount() {
    this.getLookups();
  }

  getLookups = () => {
    getLookUpTables(["States", "ParkingTypes", "StatusTypes"])
      .then(this.onGetLookupsSuccess)
      .catch(this.onGetLookupsError)
      .finally(this.getHostLocations);
  };

  onGetLookupsSuccess = (response) => {
    this.setState((prevState) => {
      return {
        stateDropdownList: [...response.item.states],
        parkingTypeDropdownList: [...response.item.parkingTypes],
        statusDropdownList: [
          ...response.item.statusTypes.filter((status) => status.id <= 3),
        ], //Only use Active, Inactive, Deleted
        formData: {
          ...prevState.formData,
          status: 1,
        },
      };
    });
  };

  onGetLookupsError = () => {
    _logger("Unable to retrieve lookups.");
  };

  getHostLocations = () => {
    getHostProfiles()
      .then(this.onGetHostProfilesSuccess)
      .catch(this.onGetHostProfilesError)
      .finally(this.getParking);
  };

  onGetHostProfilesSuccess = (response) => {
    let hostProfiles = response.items;
    hostProfiles = hostProfiles.map(this.mapAddressFromProfile);
    this.setState(() => {
      return { userLocations: hostProfiles };
    });
  };

  onGetHostProfilesError = () => {
    _logger("Error retrieving host profiles.");
  };

  getParking = () => {
    parkingService
      .getCreatedBy()
      .then(this.onGetParkingSuccess)
      .catch(this.onGetParkingError);
  };

  onGetParkingSuccess = (response) => {
    let parkingProfiles = response.items;
    parkingProfiles = parkingProfiles.filter((profile) => {
      if (profile.status.id === 3) {
        return false;
      }
      return true;
    });
    const userLocations = parkingProfiles.map(this.mapAddressFromProfile);
    // Sort the address array to return only unique addresses.
    const uniqueUserLocations = [
      ...userLocations.filter((profile, i, ar) => {
        if (
          ar.map((p) => p.lineOne).indexOf(profile.lineOne) === i &&
          profile.id !== 0
        ) {
          return true;
        } else {
          return false;
        }
      }),
    ];

    this.setState(
      (prevState) => {
        return {
          userLocations: [...prevState.userLocations, ...uniqueUserLocations],
          userParkingProfiles: parkingProfiles,
        };
      },
      () => {
        const profileId = this.props.match.params.profileId;
        if (profileId) {
          parkingService
            .getById(profileId)
            .then(this.onGetByIdSuccess)
            .catch(this.onGetByIdError);
        }
      }
    );
  };

  onGetParkingError = () => {
    this.props.history.push(`/parking`);
  };

  mapAddressFromProfile = (profile) => {
    return {
      id: profile.location.id,
      lineOne: profile.location.lineOne,
      lineTwo: profile.location.lineTwo,
      city: profile.location.city,
      state: profile.location.state.code,
      zip: profile.location.zip,
      latitude: profile.location.latitude,
      longitude: profile.location.longitude,
    };
  };

  onGetByIdSuccess = (response) => {
    // Ensure there is a valid parking profile with the given profileId,
    // and ensure the current user has an Admin role, or is a host that
    // created the associated parking profile. If not, re-direct to "/parking".
    const profile = response.item;
    const currentUserRoles = this.props.currentUser.roles.map(
      (role) => role.name
    );
    if (
      profile &&
      (currentUserRoles.includes("Admin") ||
        profile.createdBy.id === this.props.currentUser.id)
    ) {
      this.setState(() => {
        const formData = {
          locationId: profile.location.id,
          lineOne: profile.location.lineOne,
          city: profile.location.city,
          state: profile.location.state.id,
          zip: profile.location.zip,
          latitude: profile.location.latitude,
          longitude: profile.location.longitude,
          parkingType: profile.parkingType.id,
          isPrivate: profile.isPrivate,
          status: profile.status.id,
          description: profile.description,
          parkingId: profile.id,
        };
        return { formData };
      });
    } else {
      this.props.history.push(`/parking`);
    }
  };

  onGetByIdError = () => {
    this.props.history.push(`/parking`);
  };

  handleAddressSelectChange = (event) => {
    if (event.target.value !== 0) {
      const addrIndex = this.state.userLocations.findIndex(
        (addr) => addr.id === event.target.value
      );
      this.setState((prevState) => {
        const formData = {
          ...prevState.formData,
          locationId: event.target.value,
          lineOne: prevState.userLocations[addrIndex].lineOne,
          city: prevState.userLocations[addrIndex].city,
          state: prevState.stateDropdownList.find(
            (state) => state.code === prevState.userLocations[addrIndex].state
          ).id,
          zip: prevState.userLocations[addrIndex].zip,
        };
        return { formData };
      });
    } else {
      this.setState((prevState) => {
        const formData = {
          ...prevState.formData,
          locationId: "",
          lineOne: "",
          city: "",
          state: "",
          zip: "",
          latitude: 0,
          longitude: 0,
        };
        return { formData };
      });
    }
  };

  handleInputChange = (event) => {
    this.setState((prevState) => {
      const formData = {
        ...prevState.formData,
        locationId: "",
        latitude: 0,
        longitude: 0,
      };
      formData[event.target.name] = event.target.value;
      return { formData };
    });
  };

  handleParkingSpotChange = (event) => {
    if (event.target.value === 0) {
      this.props.history.push(`/parking/`);
    } else {
      if (
        !this.props.match.params.profileId ||
        event.target.value !== parseInt(this.props.match.params.profileId)
      ) {
        this.props.history.push(`/parking/${event.target.value}`);
      }
    }
  };

  handleProfileSubmit = (values) => {
    if (
      values.locationId !== "" ||
      (values.latitude !== 0 &&
        values.longitude !== 0 &&
        values.latitude !== "" &&
        values.longitude !== "")
    ) {
      this.submitParkingProfile(values);
    } else {
      this.getLatLng(values);
    }
  };

  deleteSpot = () => {
    this.setState(
      (prevState) => {
        return {
          formData: {
            ...prevState.formData,
            status: 3,
          },
        };
      },
      () => {
        this.handleProfileSubmit(this.state.formData);
      }
    );
  };

  submitParkingProfile = (values) => {
    const profile = this.mapProfile(values);
    let profileId = this.props.match.params.profileId;
    if (profileId) {
      parkingService
        .updateProfile(profile, parseInt(profileId))
        .then(this.onUpdateProfileSuccess)
        .catch(this.onUpdateProfileError);
    } else {
      parkingService
        .addProfile(profile)
        .then(this.onAddProfileSuccess)
        .catch(this.onAddProfileError);
    }
  };

  getLatLng = (values) => {
    let latitude, longitude;
    const searchAddress = `${values.lineOne}, ${values.city}, ${
      this.state.stateDropdownList.find((state) => state.id === values.state)
        .code
    } ${values.zip}`;
    Geocode.fromAddress(searchAddress)
      .then((response) => {
        // Successfully retrieved the lat/lng
        latitude = response.results[0].geometry.location.lat;
        longitude = response.results[0].geometry.location.lng;
      })
      .catch(() => {
        // Could not get the lat/lng
        latitude = 0;
        longitude = 0;
      })
      .finally(() => {
        values = {
          ...values,
          latitude: latitude,
          longitude: longitude,
        };
        this.submitParkingProfile(values);
      });
  };

  mapProfile = (values) => {
    const profile = {
      languageId: 19, // Default: set to English (for now)
      locationId: values.locationId === "" ? 0 : values.locationId,
      parkingTypeId: values.parkingType,
      description: values.description,
      isPrivate: values.isPrivate,
      statusId: values.status,
      location: {
        locationTypeId: 1,
        lineOne: values.lineOne,
        lineTwo: null,
        city: values.city,
        zip: values.zip,
        stateId: values.state,
        latitude: values.latitude,
        longitude: values.longitude,
      },
    };
    return profile;
  };

  onAddProfileSuccess = (response) => {
    toast.success("Successfully added parking spot!");
    this.props.history.push(`/parking/${response.item}`);
  };

  onAddProfileError = (error) => {
    toast.error(`Could not add parking spot. Error:  ${error.response}`);
  };

  onUpdateProfileSuccess = () => {
    if (this.state.formData.status === 3) {
      toast.success("Parking spot deleted.");
      this.props.history.push(`/parking/`);
    } else {
      toast.success("Parking spot updated.");
      parkingService
        .getById(this.state.formData.parkingId)
        .then(this.updateProfileDropdown);
    }
  };

  updateProfileDropdown = (response) => {
    this.setState((prevState) => {
      const index = prevState.userParkingProfiles.findIndex(
        (profile) => profile.id === prevState.formData.parkingId
      );
      let userParkingProfiles = [...prevState.userParkingProfiles];
      userParkingProfiles[index] = response.item;
      return { userParkingProfiles };
    });
  };

  onUpdateProfileError = (error) => {
    toast.error(`Could not update parking spot. Error:  ${error.response}`);
    debugger;
  };

  onAutocompleteLoad = (autocomplete) => {
    this.autocomplete = autocomplete;
  };

  onPlaceChanged = () => {
    if (this.autocomplete !== null) {
      let addressObject = this.autocomplete.getPlace();
      let address = addressObject.formatted_address;
      Geocode.fromAddress(`${address}`)
        .then(this.onGeocodeSuccess)
        .catch(this.onGeocodeError);
    }
  };

  onGeocodeSuccess = (response) => {
    const { lat, lng } = response.results[0].geometry.location;
    const address = response.results[0].address_components;
    let selectedAddress = this.mapAddressFromGeocode(address);
    this.setState((prevState) => {
      let selectedState = null;
      if (prevState.stateDropdownList) {
        selectedState = prevState.stateDropdownList.find(
          (stateName) => stateName.name === selectedAddress.stateName
        );
      }
      const formData = {
        ...prevState.formData,
        locationId: "",
        lineOne: `${selectedAddress.lineOne}`,
        city: `${selectedAddress.cityName}`,
        state: selectedState.id,
        zip: `${selectedAddress.zipcode}`,
        latitude: lat,
        longitude: lng,
      };
      return { formData };
    });
  };

  onGeocodeError = () => {
    _logger("Geocode Error: API Key error / Address chosen error.");
  };

  mapAddressFromGeocode = (addressComponents) => {
    let addressObj = {
      lineOne: "",
      cityName: "",
      stateName: "",
      zipcode: "",
    };
    addressComponents.forEach((addressEle) => {
      const componentType = addressEle.types[0];

      switch (componentType) {
        case "street_number": {
          addressObj.lineOne = `${addressEle.long_name} `;
          break;
        }

        case "route": {
          addressObj.lineOne += addressEle.short_name;
          break;
        }

        case "postal_code": {
          addressObj.zipcode = `${addressEle.long_name}`;
          break;
        }

        case "locality":
          addressObj.cityName = addressEle.long_name;
          break;

        case "administrative_area_level_1": {
          addressObj.stateName = addressEle.long_name;
          break;
        }
      }
    });

    return addressObj;
  };

  cancelUpdate = () => {
    this.props.history.push(`/parking/`);
  };

  render() {
    return (
      <Fragment>
        <LoadScript
          id="script-loader"
          googleMapsApiKey={GOOGLE_API_KEY}
          libraries={libraries}
        >
          <div className="py-4">
            <Grid item xs={12}>
              <Card className="p-4 mb-4">
                <div className="font-size-lg font-weight-bold">
                  Host parking spots
                </div>
                <Divider className="my-4" />
                <Formik
                  enableReinitialize={true}
                  initialValues={this.state.formData}
                  validationSchema={ParkingSchema}
                  onSubmit={this.handleProfileSubmit}
                >
                  {(formikProps) => {
                    const {
                      values,
                      touched,
                      errors,
                      handleSubmit,
                      handleChange,
                      handleBlur,
                    } = formikProps;
                    return (
                      <Form onSubmit={handleSubmit}>
                        <Grid container spacing={4}>
                          <Grid item xs={12} sm={6}>
                            {this.state.userParkingProfiles.length > 0 ? (
                              <Fragment>
                                <div className="font-size-md font-weight-bold">
                                  {this.props.match.params.profileId
                                    ? "Choose a different parking spot to update"
                                    : "Update an existing parking spot"}
                                </div>
                                <TextField
                                  select
                                  fullWidth
                                  id="parkingId"
                                  name="parkingId"
                                  label="Select an existing parking spot"
                                  value={values.parkingId}
                                  variant="outlined"
                                  onChange={this.handleParkingSpotChange}
                                  className="m-2"
                                  disabled={
                                    this.state.userParkingProfiles.length === 0
                                  }
                                >
                                  <MenuItem key={`profile_0`} value={0}>
                                    Select an existing parking spot
                                  </MenuItem>
                                  {this.state.userParkingProfiles.length > 0 ? (
                                    this.state.userParkingProfiles.map(
                                      (profile) => (
                                        <MenuItem
                                          key={`address_${profile.id}`}
                                          value={profile.id}
                                        >
                                          {`${profile.location.lineOne}, ${profile.location.city}, ${profile.location.state.code} - ${profile.parkingType.name} (${profile.status.name})`}
                                        </MenuItem>
                                      )
                                    )
                                  ) : (
                                    <div></div>
                                  )}
                                </TextField>
                                <Divider className="my-4" />
                              </Fragment>
                            ) : (
                              ""
                            )}
                            <div className="font-size-md font-weight-bold">
                              {this.props.match.params.profileId
                                ? "Edit details"
                                : "Create a new parking spot"}
                            </div>
                            {this.props.match.params.profileId ||
                            this.state.userLocations.length === 0 ? (
                              ""
                            ) : (
                              <Fragment>
                                <TextField
                                  select
                                  fullWidth
                                  id="locationId"
                                  name="locationId"
                                  label="Select a previous address"
                                  value={values.locationId}
                                  variant="outlined"
                                  onChange={this.handleAddressSelectChange}
                                  className="m-2"
                                  disabled={
                                    this.state.userLocations.length === 0 ||
                                    this.props.match.params.profileId
                                  }
                                >
                                  <MenuItem key={`address_0`} value={0}>
                                    Select a previous address
                                  </MenuItem>
                                  {this.state.userLocations.length > 0 ? (
                                    this.state.userLocations.map((profile) => (
                                      <MenuItem
                                        key={`address_${profile.id}`}
                                        value={profile.id}
                                      >
                                        {`${profile.lineOne}, ${profile.city}, ${profile.state}`}
                                      </MenuItem>
                                    ))
                                  ) : (
                                    <div></div>
                                  )}
                                </TextField>
                                <div>
                                  {" "}
                                  <div
                                    className="font-size-md font-weight-bold"
                                    style={{ textAlign: "center" }}
                                  >
                                    or
                                  </div>
                                </div>
                              </Fragment>
                            )}
                            <Autocomplete
                              onLoad={this.onAutocompleteLoad}
                              onPlaceChanged={this.onPlaceChanged}
                            >
                              <TextField
                                fullWidth
                                className="m-2"
                                id="lineOne"
                                name="lineOne"
                                value={values.lineOne}
                                variant="outlined"
                                onChange={this.handleInputChange}
                                onBlur={handleBlur}
                                error={
                                  touched.lineOne && Boolean(errors.lineOne)
                                }
                                helperText={touched.lineOne && errors.lineOne}
                              />
                            </Autocomplete>
                            <div>
                              <TextField
                                className="m-2"
                                id="city"
                                name="city"
                                label="City"
                                variant="outlined"
                                onChange={this.handleInputChange}
                                onBlur={handleBlur}
                                value={values.city}
                                error={touched.city && Boolean(errors.city)}
                                helperText={touched.city && errors.city}
                              />
                              <TextField
                                select
                                id="state"
                                name="state"
                                label="State"
                                value={values.state}
                                variant="outlined"
                                onChange={this.handleInputChange}
                                error={touched.state && Boolean(errors.state)}
                                helperText={touched.state && errors.state}
                                className="m-2"
                                style={{ minWidth: "fit-content" }}
                              >
                                {this.state.stateDropdownList.map((state) => (
                                  <MenuItem
                                    key={`state_${state.id}`}
                                    value={state.id}
                                  >
                                    {`${state.code}`}
                                  </MenuItem>
                                ))}
                              </TextField>
                              <TextField
                                className="m-2"
                                id="zip"
                                name="zip"
                                label="Zip Code"
                                variant="outlined"
                                value={values.zip}
                                onChange={this.handleInputChange}
                                onBlur={handleBlur}
                              />
                            </div>
                            <div>
                              <TextField
                                select
                                id="parkingType"
                                name="parkingType"
                                label="Parking type"
                                value={values.parkingType}
                                variant="outlined"
                                onChange={handleChange}
                                error={
                                  touched.parkingType &&
                                  Boolean(errors.parkingType)
                                }
                                helperText={
                                  touched.parkingType && errors.parkingType
                                }
                                className="m-2 w-50"
                              >
                                {this.state.parkingTypeDropdownList.map(
                                  (parkingType) => (
                                    <MenuItem
                                      key={`parkingType_${parkingType.id}`}
                                      value={parkingType.id}
                                    >
                                      {`${parkingType.name}`}
                                    </MenuItem>
                                  )
                                )}
                              </TextField>
                              <FormControl
                                component="fieldset"
                                className="pr-4"
                              >
                                <FormControlLabel
                                  label="Private parking?"
                                  labelPlacement="start"
                                  control={
                                    <Checkbox
                                      id="isPrivate"
                                      name="isPrivate"
                                      checked={values.isPrivate}
                                      onChange={handleChange}
                                      value={values.isPrivate}
                                      onBlur={handleBlur}
                                    />
                                  }
                                />
                              </FormControl>
                            </div>
                            {this.props.match.params.profileId ? (
                              <TextField
                                select
                                id="status"
                                name="status"
                                label="Parking status"
                                value={values.status}
                                variant="outlined"
                                onChange={handleChange}
                                error={touched.status && Boolean(errors.status)}
                                helperText={touched.status && errors.status}
                                className="m-2 w-50"
                              >
                                {this.state.statusDropdownList.map((status) => (
                                  <MenuItem
                                    key={`status_${status.id}`}
                                    value={status.id}
                                  >
                                    {`${status.name}`}
                                  </MenuItem>
                                ))}
                              </TextField>
                            ) : (
                              ""
                            )}
                            <TextField
                              fullWidth
                              className="m-2"
                              id="description"
                              name="description"
                              label="Parking Description"
                              value={values.description}
                              multiline
                              rows="6"
                              variant="outlined"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={
                                touched.description &&
                                Boolean(errors.description)
                              }
                              inputProps={{ maxLength: 600 }}
                            />
                            <Divider />
                            <div className="mt-2">
                              <Button
                                variant="contained"
                                color="primary"
                                label="Submit"
                                type="submit"
                                className="m-2"
                              >
                                {this.props.match.params.profileId
                                  ? "Update"
                                  : "Submit"}
                              </Button>
                              {this.props.match.params.profileId ? (
                                <Fragment>
                                  <Button
                                    variant="contained"
                                    className="m-2 text-danger"
                                    onClick={this.deleteSpot}
                                  >
                                    Delete
                                  </Button>
                                  <Button
                                    variant="contained"
                                    color="default"
                                    className="m-2"
                                    onClick={this.cancelUpdate}
                                  >
                                    Cancel
                                  </Button>
                                </Fragment>
                              ) : (
                                ""
                              )}
                            </div>
                          </Grid>
                        </Grid>
                      </Form>
                    );
                  }}
                </Formik>
              </Card>
            </Grid>
          </div>
        </LoadScript>
      </Fragment>
    );
  }
}

Parking.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      profileId: PropTypes.string,
    }),
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.number.isRequired,
    roles: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      })
    ),
  }).isRequired,
};

export default Parking;
