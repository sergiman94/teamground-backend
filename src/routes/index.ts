import express from 'express'
import defaultNetwork from '../api/services/defaultRoute/defaultNetwork'
import usersRoutes from './users.route'
import teamsRoutes from './teams.route'
import matchesRoutes from './matches.route'
import fieldsRoutes from './fields.route'
import bookingsRoutes from './bookings.route'
import postsRoutes from './posts.route'
import promosRoutes from './promos.route'
import trainingsRoutes from './trainings.route'
import mailerSendRoutes from './mailerSend.route'
import notificationRoutes from './notifications.route'
import AASA from '../api/services/AASA/AASA'

export default function routes (server) {
    server.use('/apple-app-site-association', AASA)
    server.use('/v1/', defaultNetwork)
    server.use('/v1/users', usersRoutes)
    server.use('/v1/teams', teamsRoutes)
    server.use('/v1/matches', matchesRoutes)
    server.use('/v1/fields', fieldsRoutes)
    server.use('/v1/bookings', bookingsRoutes)
    server.use('/v1/posts', postsRoutes)
    server.use('/v1/promos', promosRoutes)
    server.use('/v1/trainings', trainingsRoutes)
    server.use('/v1/mailersend', mailerSendRoutes)
    server.use('/v1/notifications', notificationRoutes)
}
