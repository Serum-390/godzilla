import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import PropTypes from 'prop-types';
import MaskedInput from 'react-text-mask';
import Input from '@material-ui/core/Input';

const useStyles = makeStyles((theme) => ({
  button: {
    display: 'block',
  },
  formControl: {
    margin: theme.spacing(2),
    minWidth: 120,
  },
}));

function ProvinceOptions({province,setProvince,defaultValue}) {
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

  const handleChange = (event) => {
    setProvince(event.target.value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <div>
      <FormControl className={classes.formControl}>
        <InputLabel id="demo-controlled-open-select-label">Province</InputLabel>
        <Select
          labelId="demo-controlled-open-select-label"
          id="demo-controlled-open-select"
          open={open}
          onClose={handleClose}
          onOpen={handleOpen}
          value={province}
          defaultValue={defaultValue}
          onChange={handleChange}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value='AB'>AB</MenuItem>
          <MenuItem value='BC'>BC</MenuItem>
          <MenuItem value='MB'>MB</MenuItem>
          <MenuItem value='NB'>NB</MenuItem>
          <MenuItem value='NL'>NL</MenuItem>
          <MenuItem value='NT'>NT</MenuItem>
          <MenuItem value='NS'>NS</MenuItem>
          <MenuItem value='NU'>NU</MenuItem>
          <MenuItem value='ON'>ON</MenuItem>
          <MenuItem value='PE'>PE</MenuItem>
          <MenuItem value='QC'>QC</MenuItem>
          <MenuItem value='SK'>SK</MenuItem>
          <MenuItem value='YT'>YT</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
}

function TextMaskCustom(props) {
  const { inputRef, ...other } = props;

  return (
    <MaskedInput
      {...other}
      ref={(ref) => {
        inputRef(ref ? ref.inputElement : null);
      }}
      mask={['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
      placeholderChar={'\u2000'}
      showMask
    />
  );
}

TextMaskCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
};

function PhoneNumberInput({contact, setContact}) {
  const [values, setValues] = React.useState({
    textmask: '(1  )    -    ',
  });

  const handleChange = (event) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    });
    setContact(event.target.value);
  };

  return (
    <div>
      <FormControl>
        <InputLabel htmlFor="formatted-text-mask-input">Phone Number</InputLabel>
        <Input
          value={
            (contact !== undefined) ? contact : values.textmask
          }
          onChange={handleChange}
          name="textmask"
          id="formatted-text-mask-input"
          inputComponent={TextMaskCustom}
        />
      </FormControl>
    </div>
  );
}

export default function CustomerForm(props) {
  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [province, setProvince] = React.useState(props.customerProvince);
  const [contact, setContact] = React.useState(props.customerPhone);

  return (
    <div>
      <Button variant="contained" color="primary" style={{ float: 'right' }} onClick={handleClickOpen}>
      {props.initialButton}
      </Button>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{props.dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {props.dialogContentText}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="company"
            label="Company Name"
            type="string"
            defaultValue={props.customerCompanyName}

            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            id="customer"
            label="Customer Name"
            type="string"
            defaultValue={props.customerName}

            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            id="address"
            label="Address"
            type="string"
            defaultValue={props.customerAddress}

            fullWidth
          />
          <Grid container spacing={2}>
            <Grid item md={3}>
              <TextField
                autoFocus
                margin="normal"
                id="city"
                label="City"
                type="text"
                defaultValue={props.customerCity}
              />
            </Grid>
            <Grid item md={3}>
              <TextField
                autoFocus
                margin="normal"
                id="postalCode"
                label="Postal Code"
                inputProps={{ maxLength: 6 }}
                type="text"
                defaultValue={props.customerPostal}
              />
            </Grid>
            <Grid item md={3}>
            <ProvinceOptions province={province} setProvince={setProvince} defaultValue={props.customerProvince}  />
            </Grid>
          </Grid>
          <PhoneNumberInput contact={contact} setContact={setContact} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            {props.deleteButton}
          </Button>
          <Button onClick={handleClose} color="primary">
            {props.submitButton}
          </Button>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
