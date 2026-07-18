const { connectToDatabase, closeDatabaseConnection } = require('../src/db/mongoClient');
const { createPasswordHash } = require('../src/utils/password');

const skillNames = [
  'React Hooks',
  'JavaScript Basics',
  'MongoDB Queries',
  'Node Express APIs',
  'Python Debugging',
  'Resume Review',
  'Git and GitHub',
  'SQL Practice',
  'Machine Learning Concepts',
  'Public Speaking',
  'Technical Interview Prep',
  'HTML CSS Layout',
  'Data Cleaning with Pandas',
  'Circuit Analysis',
  'Presentation Design',
];

const categories = ['Programming', 'Career', 'Language', 'Math', 'Design', 'Engineering'];
const levels = ['Beginner', 'Intermediate', 'Advanced'];
const years = ['First Year', 'Second Year', 'Third Year', 'Fourth Year', 'Graduate'];
const majors = ['Computer Engineering', 'Computer Science', 'Data Science', 'Business', 'Electrical Engineering'];
const statuses = ['pending', 'accepted', 'rejected', 'cancelled'];
const sessionStatuses = ['scheduled', 'completed', 'cancelled'];

function pick(items, index) {
  return items[index % items.length];
}

function futureDate(index) {
  const date = new Date();
  date.setDate(date.getDate() + (index % 45));
  date.setHours(10 + (index % 9), index % 2 === 0 ? 0 : 30, 0, 0);
  return date;
}

function createUsers() {
  const users = [
    {
      username: 'demo',
      passwordHash: createPasswordHash('demo123'),
      displayName: 'Demo Student',
      major: 'Computer Engineering',
      year: 'Fourth Year',
      contactPreference: 'In-app request',
      role: 'student',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  for (let index = 1; index <= 119; index += 1) {
    users.push({
      username: `student${index}`,
      passwordHash: createPasswordHash('student123'),
      displayName: `Student ${index}`,
      major: pick(majors, index),
      year: pick(years, index),
      contactPreference: index % 3 === 0 ? 'Online meeting link' : 'In-app request',
      role: 'student',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return users;
}

function createSkills(users) {
  const skills = [];

  for (let index = 0; index < 760; index += 1) {
    const user = users[index % users.length];
    const skillName = pick(skillNames, index);
    const type = index % 2 === 0 ? 'offer' : 'learn';

    skills.push({
      ownerId: user._id.toString(),
      ownerName: user.displayName,
      name: skillName,
      category: pick(categories, index),
      type,
      level: pick(levels, index),
      description:
        type === 'offer'
          ? `I can help classmates practice ${skillName} with examples and project feedback.`
          : `I want peer help to improve my understanding of ${skillName}.`,
      availability: index % 3 === 0 ? 'Weekends' : index % 3 === 1 ? 'Weekday evenings' : 'Flexible',
      locationPreference: index % 4 === 0 ? 'Library' : 'Online',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return skills;
}

function createSwapRequests(users) {
  const swapRequests = [];

  for (let index = 0; index < 230; index += 1) {
    const requester = users[index % users.length];
    const receiver = users[(index + 7) % users.length];

    swapRequests.push({
      requesterId: requester._id.toString(),
      requesterName: requester.displayName,
      receiverId: receiver._id.toString(),
      receiverName: receiver.displayName,
      requestedSkill: pick(skillNames, index),
      offeredSkill: pick(skillNames, index + 3),
      message: `Hi ${receiver.displayName}, can we exchange help on ${pick(skillNames, index)}?`,
      status: pick(statuses, index),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return swapRequests;
}

function createSessions(users) {
  const sessions = [];

  for (let index = 0; index < 160; index += 1) {
    const firstStudent = users[index % users.length];
    const secondStudent = users[(index + 11) % users.length];

    sessions.push({
      participantIds: [firstStudent._id.toString(), secondStudent._id.toString()],
      participants: [firstStudent.displayName, secondStudent.displayName],
      skillName: pick(skillNames, index),
      meetingTime: futureDate(index),
      location: index % 2 === 0 ? 'Online' : 'Campus Library',
      notes: 'Synthetic session generated for demo and rubric data volume.',
      status: pick(sessionStatuses, index),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return sessions;
}

async function seed() {
  const database = await connectToDatabase();

  await database.collection('users').deleteMany({});
  await database.collection('skills').deleteMany({});
  await database.collection('swapRequests').deleteMany({});
  await database.collection('sessions').deleteMany({});

  const users = createUsers();
  await database.collection('users').insertMany(users);

  const insertedUsers = await database.collection('users').find({}).toArray();
  const skills = createSkills(insertedUsers);
  const swapRequests = createSwapRequests(insertedUsers);
  const sessions = createSessions(insertedUsers);

  await database.collection('skills').insertMany(skills);
  await database.collection('swapRequests').insertMany(swapRequests);
  await database.collection('sessions').insertMany(sessions);

  const totalRecords = insertedUsers.length + skills.length + swapRequests.length + sessions.length;
  console.log(`Seed complete. Inserted ${totalRecords} synthetic records.`);
  console.log('Demo login: username demo, password demo123');

  await closeDatabaseConnection();
}

seed().catch(async (error) => {
  console.error(error);
  await closeDatabaseConnection();
  process.exit(1);
});
