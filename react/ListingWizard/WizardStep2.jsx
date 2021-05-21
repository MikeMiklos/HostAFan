import React, { Fragment, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { withFormik } from "formik";
import PropTypes from "prop-types";
import FileUpload from "../FileUpload";
import {
  Button,
  Card,
  CardHeader,
  Divider,
  FormControl,
  FormLabel,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
} from "@material-ui/core";
import * as Yup from "yup";

// import logger from "sabio-debug";
// const _logger = logger.extend("ListingWizard - Step 2");

const WizardStep2 = (props) => {
  const {
    values,
    hostProfiles,
    hostParkingProfiles,
    touched,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    isValid,
    updateValidSteps,
    setFieldValue,
    updateData,
    onBack,
  } = props;

  const history = useHistory();

  useEffect(() => {
    onChange();
  }, [values]);

  useEffect(() => {
    updateValidSteps(2, isValid);
  }, [isValid]);

  const onChange = () => {
    props.onChange(values);
    updateData(values);
  };

  const handleRadioChange = (value) => {
    setFieldValue("serviceTypeId", parseInt(value));
    setFieldValue("serviceProfileId", 0);
    setFieldValue("parkingProfileId", 0);
    setFieldValue("costPerNight", 0);
  };

  const handleStayPriceChange = (e) => {
    const newNum = parseInt(e.target.value);
    // _logger("CostPerNight changed:  ", newNum);
    if (newNum > -1) {
      setFieldValue(e.target.name, newNum);
    } else if (e.target.value === "") {
      setFieldValue(e.target.name, 0);
    }
  };

  const handleAvailabilityDateChange = (e) => {
    // _logger(`The field ${e.target.name} changed to ${e.target.value}`);
    if (e.target.name === "availabilityStart") {
      // Set start date
      setFieldValue("availabilityStart", e.target.value);
      if (values.availabilityEnd === "") {
        // If end date hasn't been set yet, set it to start date
        setFieldValue("availabilityEnd", e.target.value);
      } else if (values.availabilityEnd < e.target.value) {
        // If the end date is before the new start date, set the end date to match start date
        setFieldValue("availabilityEnd", e.target.value);
      }
    } else {
      // Set new end date
      setFieldValue(e.target.name, e.target.value);
      // If end date is now earlier than start date, set start date to match end date
      if (e.target.value < values.availabilityStart) {
        setFieldValue("availabilityStart", e.target.value);
      }
    }
  };

  const handleDateTimeChange = (e) => {
    // _logger(
    //   `Host event date/time change: ${e.target.value}, ${Date(e.target.value)}`
    // );

    if (e.target.name === "hostEventStartTime") {
      setFieldValue("hostEventStartTime", e.target.value);
      if (
        values.hostEventEndTime !== "" &&
        values.hostEventEndTime < e.target.value
      ) {
        // _logger("Default setting end day/time to match start day/time.");
        setFieldValue("hostEventEndTime", e.target.value);
      }
    } else if (
      e.target.name === "hostEventEndTime" &&
      e.target.value < values.hostEventStartTime
    ) {
      // _logger("Default setting end day/time to match start day/time.");
      setFieldValue(e.target.name, values.hostEventStartTime);
    } else {
      setFieldValue(e.target.name, e.target.value);
    }
  };

  const handleMaxCapacityChange = (e) => {
    const newNum = parseInt(e.target.value);
    // _logger("Max Capacity changed:  ", newNum);
    if (newNum > -1) {
      setFieldValue(e.target.name, newNum);
    } else if (e.target.value === "") {
      setFieldValue(e.target.name, 0);
    }
  };

  const updateUrl = (url, setFieldValue) => {
    // _logger("File upload: UpdateUrl firing", url);
    setFieldValue("imageUrl", url[0].url);
  };

  const backClicked = () => {
    onBack(values);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-4 mb-4">
        <CardHeader
          title="Enter Listing Details"
          className="bg-amy-crisp text-white"
          titleTypographyProps={{ variant: "h3" }}
        />
        <Divider className="my-4" />
        <Grid container spacing={4} className="mb-0">
          <Grid item xs={12} md={6} className="mb-0">
            <div className="p-3">
              <TextField
                fullWidth
                className="m-2"
                id="name"
                name="title"
                label="Title"
                value={values.title}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.title && Boolean(errors.title)}
                helperText={touched.title && errors.title}
                variant="outlined"
              />
              <FormControl
                component="fieldset"
                fullwidth="true"
                className="m-2"
                error={touched.description && Boolean(errors.serviceTypeId)}
                helpertext={touched.description && errors.serviceTypeId}
              >
                <FormLabel component="legend">
                  Select A Listing Service
                </FormLabel>
                <RadioGroup
                  row
                  name="serviceTypeId"
                  value={values.serviceTypeId}
                  onChange={(e, val) => handleRadioChange(val)}
                  aria-label="serviceType"
                >
                  <FormControlLabel
                    value={1}
                    control={<Radio className="ml-2" />}
                    label="Overnight Stay"
                    className="mb-0"
                  />
                  <FormControlLabel
                    value={3}
                    control={<Radio className="ml-2" />}
                    label="Parking spot"
                    className="mb-0"
                  />
                  <FormControlLabel
                    value={4}
                    control={<Radio className="ml-2" />}
                    label="Hosted Event"
                    className="mb-0"
                  />
                </RadioGroup>
              </FormControl>
              {values.serviceTypeId === 1 && hostProfiles.length > 0 ? (
                <Fragment>
                  <TextField
                    fullWidth
                    className="m-2"
                    id="outlined-select-currency"
                    name="serviceProfileId"
                    select
                    label="Property"
                    value={values.serviceProfileId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(errors.serviceProfileId)}
                    helperText={errors.serviceProfileId}
                    variant="outlined"
                  >
                    <MenuItem key={`hostProfile_0`} value={0}>
                      Select a Property
                    </MenuItem>
                    {hostProfiles}
                  </TextField>
                </Fragment>
              ) : values.serviceTypeId === 1 ? (
                <div fullwidth="true" className="ml-2 mb-2 p-0">
                  <Button
                    className="m-0 text-white btn-gradient bg-plum-plate"
                    color="inherit"
                    variant="contained"
                    onClick={() => {
                      history.push("/hosts/create");
                    }}
                  >
                    Create a Host Profile
                  </Button>
                </div>
              ) : null}

              {values.serviceTypeId === 3 && hostParkingProfiles.length > 0 ? (
                <TextField
                  fullWidth
                  className="m-2"
                  id="outlined-select-currency"
                  name="parkingProfileId"
                  select
                  label="Parking Spot"
                  value={values.parkingProfileId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(errors.parkingProfileId)}
                  helperText={errors.parkingProfileId}
                  variant="outlined"
                >
                  <MenuItem key={`hostProfile_0`} value={0}>
                    Select a Parking Spot
                  </MenuItem>
                  {hostParkingProfiles}
                </TextField>
              ) : values.serviceTypeId === 3 ? (
                <div fullwidth="true" className="ml-2 mb-2 p-0">
                  <Button
                    className="m-0 text-white btn-gradient bg-plum-plate"
                    color="inherit"
                    variant="contained"
                    onClick={() => {
                      history.push("/parking/");
                    }}
                  >
                    Create a Parking Profile
                  </Button>
                </div>
              ) : null}
              {(values.serviceTypeId === 1 && hostProfiles.length > 0) ||
              (values.serviceTypeId === 3 && hostParkingProfiles.length > 0) ? (
                <FormControl
                  fullwidth="true"
                  className="flex-row w-100 ml-2 mt-2 mb-2 p-0"
                >
                  <TextField
                    name="availabilityStart"
                    label="Start Date"
                    type="date"
                    className="mr-2 flex-fill"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    value={values.availabilityStart}
                    onChange={handleAvailabilityDateChange}
                    onBlur={handleBlur}
                    variant="outlined"
                    error={Boolean(errors.availabilityStart)}
                    helperText={errors.availabilityStart}
                  />
                  <TextField
                    name="availabilityEnd"
                    label="End Date"
                    type="date"
                    className="mr-2 flex-fill"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    value={values.availabilityEnd}
                    onChange={handleAvailabilityDateChange}
                    onBlur={handleBlur}
                    variant="outlined"
                    error={Boolean(errors.availabilityEnd)}
                    helperText={errors.availabilityEnd}
                  />
                  <TextField
                    className="mr-0 w-25"
                    id="outlined-textarea"
                    name="costPerNight"
                    label={
                      values.serviceTypeId === 1 ? "Price / Night" : "Price"
                    }
                    type="number"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                    }}
                    value={values.costPerNight === 0 ? "" : values.costPerNight}
                    onChange={handleStayPriceChange}
                    onBlur={handleBlur}
                    variant="outlined"
                    error={Boolean(errors.costPerNight)}
                    helperText={errors.costPerNight}
                  />
                </FormControl>
              ) : null}
              {values.serviceTypeId === 4 && (
                <FormControl
                  fullwidth="true"
                  className="flex-row w-100 ml-2 mt-2 mb-0 p-0"
                >
                  <TextField
                    name="hostEventStartTime"
                    label="Start Time"
                    type="datetime-local"
                    className="mr-2"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      step: 300, // 5 min
                    }}
                    value={values.hostEventStartTime}
                    onChange={handleDateTimeChange}
                    onBlur={handleBlur}
                    variant="outlined"
                    error={Boolean(errors.hostEventStartTime)}
                  />
                  <TextField
                    name="hostEventEndTime"
                    label="End Time"
                    type="datetime-local"
                    className="mr-2"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      step: 300, // 5 min
                    }}
                    value={values.hostEventEndTime}
                    onChange={handleDateTimeChange}
                    onBlur={handleBlur}
                    variant="outlined"
                  />
                  <TextField
                    className="mr-0"
                    id="outlined-textarea"
                    name="hostEventMaxCapacity"
                    label="Max Capacity"
                    type="number"
                    value={
                      values.hostEventMaxCapacity === 0
                        ? ""
                        : values.hostEventMaxCapacity
                    }
                    onChange={handleMaxCapacityChange}
                    onBlur={handleBlur}
                    variant="outlined"
                  />
                </FormControl>
              )}
              {values.serviceTypeId === 4 && errors.hostEventStartTime && (
                <Grid item xs={12} md={6}>
                  <FormControl error className="ml-4" fullWidth>
                    <FormHelperText>{errors.hostEventStartTime}</FormHelperText>
                  </FormControl>
                </Grid>
              )}

              <TextField
                fullWidth
                className="m-2"
                id="outlined-textarea"
                name="shortDescription"
                label="Short Description"
                value={values.shortDescription}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  touched.shortDescription && Boolean(errors.shortDescription)
                }
                helperText={touched.shortDescription && errors.shortDescription}
                multiline
                variant="outlined"
              />
              <TextField
                fullWidth
                className="m-2 mb-4"
                id="outlined-textarea"
                name="description"
                label="Description"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.description && Boolean(errors.description)}
                helperText={touched.description && errors.description}
                multiline
                variant="outlined"
              />
            </div>
          </Grid>
          <Grid item xs={12} md={6} className="mb-0">
            <InputLabel variant="outlined">Place main image below:</InputLabel>
            <FileUpload
              updateUrl={(response) => {
                updateUrl(response, setFieldValue);
              }}
              isMultiple={true}
            />
          </Grid>
        </Grid>
        <Button
          type="button"
          className="mx-4"
          color="secondary"
          variant="contained"
          onClick={backClicked}
          disabled={!isValid}
        >
          Back
        </Button>
        <Button
          type="submit"
          color="primary"
          variant="contained"
          disabled={!isValid}
        >
          Next
        </Button>
      </Card>
    </form>
  );
};

WizardStep2.propTypes = {
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
    description: PropTypes.string.isRequired,
    shortDescription: PropTypes.string.isRequired,
    listingImages: PropTypes.arrayOf(PropTypes.shape({})),
  }),
  hostProfiles: PropTypes.arrayOf(PropTypes.object),
  hostParkingProfiles: PropTypes.arrayOf(PropTypes.object),
  touched: PropTypes.shape({
    title: PropTypes.bool,
    serviceTypeId: PropTypes.bool,
    serviceProfileId: PropTypes.bool,
    parkingProfileId: PropTypes.bool,
    hostEventProfileId: PropTypes.bool,
    availabilityStart: PropTypes.bool,
    availabilityEnd: PropTypes.bool,
    costPerNight: PropTypes.bool,
    hostEventStartTime: PropTypes.bool,
    hostEventEndTime: PropTypes.bool,
    hostEventMaxCapacity: PropTypes.bool,
    shortDescription: PropTypes.bool,
    description: PropTypes.bool,
  }),
  errors: PropTypes.shape({
    title: PropTypes.string,
    serviceTypeId: PropTypes.string,
    serviceProfileId: PropTypes.string,
    parkingProfileId: PropTypes.string,
    hostEventProfileId: PropTypes.string,
    availabilityStart: PropTypes.string,
    availabilityEnd: PropTypes.string,
    costPerNight: PropTypes.number,
    hostEventStartTime: PropTypes.string,
    shortDescription: PropTypes.string,
    description: PropTypes.string,
  }),
  handleChange: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  backLabel: PropTypes.string,
  updateData: PropTypes.func.isRequired,
  isValid: PropTypes.bool.isRequired,
  updateValidSteps: PropTypes.func.isRequired,
};

export default withFormik({
  mapPropsToValues: (props) => ({
    eventId: props.formData.eventId,
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
    description: props.formData.description,
    shortDescription: props.formData.shortDescription,
    amenities: props.formData.amenities,
    additionalServices: props.formData.additionalServices,
    rideshareId: props.formData.rideshareId,
    rideshareCost: props.formData.rideshareCost,
    listingImages: props.formData.listingImages,
  }),

  enableReinitialize: true,

  validationSchema: Yup.object().shape({
    title: Yup.string("Please enter a title for your new listing")
      .min(5, "Name is too short")
      .max(50, "Name is too long")
      .required("Name is required"),
    shortDescription: Yup.string("Enter a short description")
      .min(10, "Please enter at least 10 characters")
      .max(
        150,
        "Too long, please enter additional details in the description field"
      )
      .required("Short description is required"),
    description: Yup.string("Enter a description")
      .min(20, "Please enter at least 20 characters")
      .required("Description is required"),
    serviceTypeId: Yup.number()
      .min(1, "Please select a service to offer.")
      .max(4),
    serviceProfileId: Yup.number().when("serviceTypeId", {
      is: (value) => value === 1,
      then: Yup.number().positive("Please select a stay profile."),
    }),
    parkingProfileId: Yup.number().when("serviceTypeId", {
      is: (value) => value === 3,
      then: Yup.number().positive("Please select a parking spot."),
    }),
    availabilityStart: Yup.string().when("serviceTypeId", {
      is: (value) => value === 1 || value === 3,
      then: Yup.string()
        .min(5)
        .required("Please select an availability start date."),
    }),
    availabilityEnd: Yup.string().when("serviceTypeId", {
      is: (value) => value === 1 || value === 3,
      then: Yup.string()
        .min(5)
        .required("Please select an availability end date."),
    }),
    costPerNight: Yup.number()
      .when("serviceTypeId", {
        is: (value) => value === 1,
        then: Yup.number()
          .min(0)
          .required("Enter the cost per night, greater than $0."),
      })
      .when("serviceTypeId", {
        is: (value) => value === 3,
        then: Yup.number().min(
          0,
          "Enter the parking cost per day, greater than $0."
        ),
      }),
    hostEventStartTime: Yup.string().when("serviceTypeId", {
      is: (value) => value === 4,
      then: Yup.string()
        .min(5)
        .required("Please select a host start day/time."),
    }),
    hostEventEndTime: Yup.string(),
    hostEventMaxCapacity: Yup.number().when("serviceTypeId", {
      is: (value) => value === 4,
      then: Yup.number()
        .min(0)
        .required("Please select a maximum capacity for the hosted event."),
    }),
  }),

  validateOnMount: true,

  handleSubmit: (values, { props }) => {
    props.onNext(values);
  },
})(WizardStep2);
