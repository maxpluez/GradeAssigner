/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import axios from 'axios';
// before mounting your React application:
import theme from '@instructure/canvas-high-contrast-theme';
import './app.css';

import { View } from '@instructure/ui-view';
import { Text } from '@instructure/ui-text';
import { Button, CondensedButton } from '@instructure/ui-buttons';
import { Heading } from '@instructure/ui-heading';
import { NumberInput } from '@instructure/ui-number-input';
import { Billboard } from '@instructure/ui-billboard';
import { IconUserLine, IconCheckLine } from '@instructure/ui-icons';
import { Table } from '@instructure/ui-table';

theme.use({ overrides: { colors: { brand: 'red' } } });

const App = () => {
  const getLtikPromise = new Promise((resolve, reject) => {
    const searchParams = new URLSearchParams(window.location.search);
    let potentialLtik = searchParams.get('ltik');
    if (!potentialLtik) {
      potentialLtik = sessionStorage.getItem('ltik');
      if (!potentialLtik) reject(new Error('Missing lti key.'));
    }
    resolve(potentialLtik);
  });

  const setLtikPromise = new Promise((resolve, reject) => {
    getLtikPromise
      .then(res => {
        sessionStorage.setItem('ltik', res);
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });

  const [members, setMembers] = React.useState([]);

  const retrieveMembers = () => {
    setLtikPromise
      .then(ltik => {
        axios
          .get(`/api/members?ltik=${ltik}`)
          .then(list => {
            setMembers(list.data);
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err);
      });
  };

  React.useEffect(retrieveMembers, []);

  const [usersShown, showUsers] = React.useState(false);
  const [gradesShown, showGrades] = React.useState(false);
  if (!usersShown && !gradesShown) {
    return (
      <View
        display="flex"
        background="brand"
        margin="0"
        padding="xx-large"
        textAlign="center"
      >
        <Billboard
          margin="auto"
          message="User Center"
          onClick={() => {
            showUsers(true);
          }}
          hero={size => <IconUserLine size={size} />}
        />
        <Billboard
          margin="auto"
          message="Grading Center"
          onClick={() => {
            showGrades(true);
          }}
          hero={size => <IconCheckLine size={size} />}
        />
      </View>
    );
  }
  if (usersShown) {
    return (
      <UserCenter
        members={members}
        retrieveMembers={retrieveMembers}
        showUsers={showUsers}
        setLtikPromise={setLtikPromise}
      />
    );
  }
  return (
    <GradingCenter
      showGrades={showGrades}
      setLtikPromise={setLtikPromise}
      members={members}
    />
  );
};

const UserCenter = ({ members, retrieveMembers, showUsers }) => {
  const [chosenMember, chooseMember] = React.useState({});

  React.useEffect(retrieveMembers, []);

  return (
    <View as="div" display="flex" margin="auto" background="brand">
      <UserList
        members={members}
        chooseMember={chooseMember}
        showUsers={showUsers}
      />
      <UserPanel chosenMember={chosenMember} />
    </View>
  );
};

const UserList = ({ members, chooseMember, showUsers }) => {
  const selectMember = event => {
    chooseMember(
      members.filter(member => member.name === event.target.innerText)[0]
    );
  };

  let membersElement = <View>Getting members...</View>;
  if (members.length !== 0) {
    membersElement = members.map(member => (
      <CondensedButton
        color="primary-inverse"
        display="block"
        onClick={selectMember}
      >
        {member.name}
      </CondensedButton>
    ));
  }

  return (
    <View as="div" margin="small" padding="small" width="50%">
      <CondensedButton
        color="primary-inverse"
        display="block"
        onClick={() => {
          showUsers(false);
        }}
      >
        {'< Back'}
      </CondensedButton>
      <br />
      {membersElement}
    </View>
  );
};

const UserPanel = ({ chosenMember }) => {
  let profileElement = <Text>Choose a member on the left to begin ...</Text>;
  if (chosenMember.name) {
    profileElement = (
      <View>
        <Heading level="h2">{chosenMember.name}</Heading>
        <View display="block">
          {chosenMember.roles.map((role, index) => {
            if (index === 0) {
              return <Text>{role}</Text>;
            }
            return <Text>{`, ${role}`}</Text>;
          })}
        </View>
        <Text display="block">{chosenMember.email}</Text>
      </View>
    );
  }
  return (
    <View as="div" margin="small" padding="small" width="50%" shadow="topmost">
      {profileElement}
    </View>
  );
};

const GradingCenter = ({ showGrades, setLtikPromise, members }) => {
  const [grades, setGrades] = React.useState([]);
  const retrieveGrades = () => {
    setLtikPromise.then(ltik => {
      axios.get(`/api/grades?ltik=${ltik}`).then(list => {
        console.log(list.data);
        setGrades(list.data);
      });
    });
  };
  React.useEffect(retrieveGrades, []);

  let tableElement = <Text>Getting grades ...</Text>;
  if (grades.length !== 0) {
    tableElement = (
      <Table caption="Top rated movies" hover>
        <Table.Head>
          <Table.Row>
            <Table.ColHeader id="name">Name</Table.ColHeader>
            <Table.ColHeader id="activity">Activity</Table.ColHeader>
            <Table.ColHeader id="score">Score</Table.ColHeader>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {grades.map(grade => (
            <Table.Row>
              <Table.RowHeader>
                {
                  members.filter(member => member.user_id === grade.userId)[0]
                    .name
                }
              </Table.RowHeader>
              <Table.Cell>{grade.lineItem}</Table.Cell>
              <Table.Cell>{`${grade.resultScore}/${grade.resultMaximum}`}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    );
  }

  const [scoreGivenStr, giveScore] = useState('');
  const handleScoreChange = event => {
    giveScore(event.target.value);
  };

  const submitGrade = () => {
    if (!/^[0-9]+\.?[0-9]*$/.test(scoreGivenStr)) {
      // eslint-disable-next-line no-alert
      alert('Please enter a proper decimal number!');
      return;
    }
    const grade = {
      scoreGiven: parseFloat(scoreGivenStr),
      activityProgress: 'Completed',
      gradingProgress: 'FullyGraded',
    };
    setLtikPromise
      .then(ltik => {
        axios
          .post(`/api/grades?ltik=${ltik}`, grade)
          .then(() => {
            retrieveGrades();
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err);
      });
  };
  return (
    <View display="block" background="brand" padding="xx-large">
      <CondensedButton
        color="primary-inverse"
        display="block"
        onClick={() => {
          showGrades(false);
        }}
      >
        {'< Back'}
      </CondensedButton>
      <View margin="xx-large">{tableElement}</View>
      <NumberInput
        renderLabel={<Text color="primary-inverse">Submit Grade: </Text>}
        onChange={handleScoreChange}
      />
      <Button color="primary" margin="medium" onClick={submitGrade}>
        Submit
      </Button>
    </View>
  );
};

export default App;
