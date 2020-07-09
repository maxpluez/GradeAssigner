import React from 'react';
import axios from 'axios';
import '@instructure/canvas-theme';
import './app.css';

import { View } from '@instructure/ui-view';
import { Text } from '@instructure/ui-text';

const App = () => {
  const [members, setMembers] = React.useState([]);
  // [chosenMember, chooseMember] = React.useState({ name: '' });

  const ltikPromise = new Promise((resolve, reject) => {
    const searchParams = new URLSearchParams(window.location.search);
    let potentialLtik = searchParams.get('ltik');
    if (!potentialLtik) {
      potentialLtik = sessionStorage.getItem('ltik'); // eslint-disable-line no-undef
      if (!potentialLtik) reject(new Error('Missing lti key.'));
    }
    resolve(potentialLtik);
  });

  const setLtikPromise = new Promise((resolve, reject) => {
    ltikPromise.then((res) => {
      sessionStorage.setItem('ltik', res);
      resolve(res);
    }).catch((err) => {
      reject(err);
    });
  });

  const retrieveMembers = () => {
    setLtikPromise.then((res) => {
      axios.get(`/api/members?ltik=${res}`).then((list) => {
        console.log(`res from server: ${list.data}`);
        setMembers(res.data);
      }).catch((err) => {
        console.log('error retrieving from server');
        console.log(err);
      });
    }).catch((err) => {
      console.log(err);
    });
  };

  React.useEffect(retrieveMembers, []);

  return (
    <View
      as="div"
      display="flex"
      margin="auto"
      background="brand"
    >
      <UserList
        members={members}
      />
      <UserPanel />
    </View>
  );
};

// eslint-disable-next-line react/prop-types
const UserList = ({ members }) => {
  console.log(`members inside UserList: ${members}`);

  return (
    <View
      as="div"
      margin="small"
      padding="small"
      width="50%"
    >
      <Text>User List</Text>
    </View>
  );
};

const UserPanel = () => {
  console.log('');
  return (
    <View
      as="div"
      margin="small"
      padding="small"
      width="50%"
      shadow="topmost"
    >
      <Text>User Profile</Text>
    </View>
  );
};

export default App;
