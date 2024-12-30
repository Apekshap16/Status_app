const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const http = require('http');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(bodyParser.json());

// Connect to PostgreSQL or MySQL
const sequelize = new Sequelize('status_page_db', 'postgres', 'Apeksha@16', {
  host: 'localhost',
  dialect: 'postgres', // Change to 'mysql' for MySQL
});

// Define Models
const Service = sequelize.define('Service', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Operational',
  },
});

const Incident = sequelize.define('Incident', {
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Service.hasMany(Incident, { foreignKey: 'serviceId' });
Incident.belongsTo(Service, { foreignKey: 'serviceId' });

// Sync Database
sequelize.sync({ force: false }).then(() => {
  console.log('Database synced');
});

io.on('connection', (socket) => {
  console.log('Client connected');
});

app.get('/api/services', async (req, res) => {
  const services = await Service.findAll();
  res.json(services);
});

app.post('/api/services', async (req, res) => {
  const { name, status } = req.body;
  const service = await Service.create({ name, status });
  io.emit('update', await Service.findAll());
  res.status(201).json(service);
});

app.put('/api/services/:id', async (req, res) => {
  const { id } = req.params;
  const { name, status } = req.body;
  const service = await Service.findByPk(id);
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }
  await service.update({ name, status });
  io.emit('update', await Service.findAll());
  res.json(service);
});

app.delete('/api/services/:id', async (req, res) => {
  const { id } = req.params;
  await Service.destroy({ where: { id } });
  io.emit('update', await Service.findAll());
  res.status(204).send();
});

app.get('/api/incidents', async (req, res) => {
  const incidents = await Incident.findAll({ include: Service });
  res.json(incidents);
});

app.post('/api/incidents', async (req, res) => {
  const { description, serviceId, status } = req.body;
  const incident = await Incident.create({ description, serviceId, status });
  io.emit('update', {
    services: await Service.findAll(),
    incidents: await Incident.findAll({ include: Service }),
  });
  res.status(201).json(incident);
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});