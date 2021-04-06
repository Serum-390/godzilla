import { Button, Grid, TextField, makeStyles, Paper, useMediaQuery, useTheme } from '@material-ui/core';
import axios from 'axios';
import React, { useState } from 'react';

const useStyles = makeStyles(theme => ({
  divStyle: {
    alignContent: 'centre',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 400,
    minWidth: 30,
    borderRadius: 20,
    border: '30px solid',
    borderImage: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    padding: 50,
    borderImageSlice: 1
  }
}));

const sendSignupData = async data => {
  try {
    const api = '/api/signup/';
    const posted = await axios.post(api, data);
    console.log(`STATUS CODE: ${posted.status}`);
    console.log(`DATA: ${posted.data || "Nothing"}`);
    return posted.status === 200 ? posted.data || {} : {};
  } catch (err) {
    console.log(err);
    return err;
  }
};

const SignUpForm = () => {
  const classes = useStyles();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const signup = () => {
    const sendData = new URLSearchParams();
    sendData.append("username", userName)
    sendData.append("password", password)
    sendData.append("email", email)
    sendSignupData(sendData)
  }
  return (
    <Paper className={classes.divStyle} square={false} variant="outlined" >
      <Grid container justify="center">
        <img alt="Logo goes here" />
      </Grid>
      <TextField label="Username" margin="normal" variant="outlined" onChange={e => setUserName(e.target.value)} />
      <TextField label="Password" margin="normal" type="password" variant="outlined" onChange={e => setPassword(e.target.value)} />
      <TextField label="email" margin="normal" variant="outlined" onChange={e => setEmail(e.target.value)} />
      <div style={{ height: 20 }} />
      <Button color="secondary" variant="contained" onClick={signup}>Sign Up</Button>
      <div style={{ height: 10 }} />
      <Button color="default">Back</Button>
    </Paper>
  );
}

const DesktopLogin = () => {
  return (
    <div>
      <Grid container style={{ minHeight: '100vh' }}>
        <Grid
          container
          item
          xs={12}
          sm={6}
          alignItems="center"
          direction="column"
          justify="space-between"
          style={{ padding: 10, }}
        >
          <div />
          <SignUpForm />
          <div />
        </Grid>
        <Grid item xs={12} sm={6}>
          <img src="https://i.pinimg.com/originals/18/93/92/18939283816bc18797283b6b249f0401.jpg"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            alt="brand"
          />
        </Grid>
      </Grid>
    </div>
  );
}

function SignUp() {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('sm'));
  return <div>{desktop ? <DesktopLogin /> : <SignUpForm />}</div>;
}

export default SignUp;