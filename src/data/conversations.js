const conversations = [
  {
    id: 1,
    username: "john_doe",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    lastMessage: "See you soon!",
    time: "2m",
    unread: 2,
    messages: [
      { fromMe: false, text: "Hey! How are you?", time: "10:00" },
      { fromMe: true, text: "I'm good! You?", time: "10:01" },
      { fromMe: false, text: "See you soon!", time: "10:02" },
    ],
  },
];
export default conversations; 