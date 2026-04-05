require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Assignment = require('./models/Assignment');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Assignment.deleteMany({});
    console.log('Cleared existing data');

    // Create professor
    const professor = await User.create({
      name: 'Dr. Smith',
      email: 'professor@demo.com',
      password: 'demo1234',
      role: 'professor',
    });
    console.log('Created professor:', professor.email);

    // Create students
    const student1 = await User.create({
      name: 'Alice Johnson',
      email: 'student@demo.com',
      password: 'demo1234',
      role: 'student',
    });

    const student2 = await User.create({
      name: 'Bob Lee',
      email: 'student2@demo.com',
      password: 'demo1234',
      role: 'student',
    });
    console.log('Created students:', student1.email, student2.email);

    // Create courses
    const course1 = await Course.create({
      title: 'Introduction to Computer Science',
      description: 'A comprehensive introduction to the fundamental concepts of computer science including algorithms, data structures, and programming paradigms.',
      professorId: professor._id,
      studentIds: [student1._id, student2._id],
    });

    const course2 = await Course.create({
      title: 'Web Development Fundamentals',
      description: 'Learn modern web development from scratch: HTML, CSS, JavaScript, React, Node.js, and database management for building full-stack applications.',
      professorId: professor._id,
      studentIds: [student1._id, student2._id],
    });
    console.log('Created courses:', course1.title, course2.title);

    // Update professor's taughtCourses
    await User.findByIdAndUpdate(professor._id, {
      taughtCourses: [course1._id, course2._id],
    });

    // Update students' enrolledCourses
    await User.findByIdAndUpdate(student1._id, {
      enrolledCourses: [course1._id, course2._id],
    });
    await User.findByIdAndUpdate(student2._id, {
      enrolledCourses: [course1._id, course2._id],
    });

    // Create assignments for course 1
    const assignment1 = await Assignment.create({
      title: 'Algorithm Analysis Report',
      description: 'Write a detailed analysis comparing the time and space complexity of at least three sorting algorithms (Bubble Sort, Merge Sort, Quick Sort). Include Big-O notation and empirical benchmarking.',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      submissionType: 'individual',
      courseId: course1._id,
      createdBy: professor._id,
    });

    const assignment2 = await Assignment.create({
      title: 'Data Structures Implementation',
      description: 'Implement a Linked List, Stack, and Queue in Python. Each data structure should include all standard operations with proper time complexity documentation.',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      submissionType: 'individual',
      courseId: course1._id,
      createdBy: professor._id,
    });

    const assignment3 = await Assignment.create({
      title: 'Group Research Project: Future of AI',
      description: 'In groups of 2-3, research and present a comprehensive report on the future of Artificial Intelligence. Cover topics like machine learning, ethics, societal impact, and career opportunities.',
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      submissionType: 'group',
      courseId: course1._id,
      createdBy: professor._id,
    });

    // Update course1 with assignment IDs
    await Course.findByIdAndUpdate(course1._id, {
      assignmentIds: [assignment1._id, assignment2._id, assignment3._id],
    });

    // Create assignments for course 2
    const assignment4 = await Assignment.create({
      title: 'Responsive Portfolio Website',
      description: 'Build a personal portfolio website using HTML, CSS, and JavaScript. The site must be fully responsive, accessible, and include sections for About, Projects, Skills, and Contact.',
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      submissionType: 'individual',
      courseId: course2._id,
      createdBy: professor._id,
    });

    const assignment5 = await Assignment.create({
      title: 'RESTful API Design',
      description: 'Design and implement a RESTful API using Node.js and Express. The API should support CRUD operations, include authentication, and be properly documented using OpenAPI/Swagger.',
      deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
      submissionType: 'individual',
      courseId: course2._id,
      createdBy: professor._id,
    });

    const assignment6 = await Assignment.create({
      title: 'Full-Stack Application (Group)',
      description: 'Build a full-stack web application in groups of 2-3 students. Use React for the frontend, Node.js/Express for the backend, and MongoDB for data storage. Deploy to a cloud platform.',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      submissionType: 'group',
      courseId: course2._id,
      createdBy: professor._id,
    });

    // Update course2 with assignment IDs
    await Course.findByIdAndUpdate(course2._id, {
      assignmentIds: [assignment4._id, assignment5._id, assignment6._id],
    });

    console.log('Created assignments for both courses');
    console.log('\n=== Seed completed successfully ===');
    console.log('\nDemo Credentials:');
    console.log('Professor: professor@demo.com / demo1234');
    console.log('Student 1: student@demo.com / demo1234');
    console.log('Student 2: student2@demo.com / demo1234');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();