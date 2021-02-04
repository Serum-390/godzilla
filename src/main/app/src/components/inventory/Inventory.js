import { Box, Button, Grid, makeStyles, Typography } from '@material-ui/core';
import React, { Fragment, useEffect, useState } from 'react';
import InventoryCard from './InventoryCard';
import MenuIcon from '@material-ui/icons/Menu'
import AppLogo from '../../misc/logo.svg';
import '../../misc/React-Spinner.css';
import { spinnyBoi } from '../About';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(1),
  },
  sort: {
    margin: theme.spacing(1),
    textTransform: 'none',
  },
}));

const getInventory = async () => {
  const api = '/api/inv/';
  const got = await fetch(api);
  const json = await got.json();
  return json.inventory || [];
};

const FilledInventoryView = ({ inventoryItems, classes }) => {
  let items = [];
  for (let i = 0; i < 10; i++) {
    inventoryItems.map(item =>
      items.push(
        <Grid item>
          <InventoryCard
            name={item.name}
            type={item.type}
            image={item.image_url}
            description={item.description}
          />
        </Grid>
      )
    );
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={2} justify='center'>
        {items}
      </Grid>
    </div>
  );
};

const Spinner = () => {
  return (
    <Box
      display='flex'
      flexDirection='column'
      flexGrow={1}
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <img src={AppLogo} alt='React Logo' className='App-logo' />
      <h1>Loading...</h1>
    </Box>
  );
};

const LoadedView = ({ classes, inventory }) => {
  return (
    <div>
      <Box display='flex' flexDirection='row-reverse'>
        <Button
          variant='contained'
          className={classes.sort}
          color='secondary'
          startIcon={<MenuIcon />}
        >
          <Typography variant='h6'>Sort By</Typography>
        </Button>
      </Box>
      <FilledInventoryView
        inventoryItems={inventory}
        classes={classes}
      />
    </div>
  );
};

const SpinBeforeLoading = ({ awaiting = async () => {},
                             minLoadingTime = 0,
                             ...props }) => {

  const [loading, setLoading] = useState(true);
  const [loadingMin, setLoadingMin] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoadingMin(false), minLoadingTime);
    awaiting().then(() => setLoading(false));
  }, [awaiting, minLoadingTime]);

  return loading || loadingMin ? spinnyBoi
                               : <Fragment>{props.children}</Fragment>;
};

const Inventory = () => {

  const classes = useStyles();
  const [inventory, setInventory] = useState([]);
  const waitForGetRequest = async () => getInventory().then(inv => setInventory(inv));

  return (
    <SpinBeforeLoading minLoadingTime={1000} awaiting={waitForGetRequest}>
      <LoadedView classes={classes} inventory={inventory} />
    </SpinBeforeLoading>
  );
};

export { Inventory, FilledInventoryView, Spinner, SpinBeforeLoading };
export default Inventory;
