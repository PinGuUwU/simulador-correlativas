import mongoose from 'mongoose'

const planSchema = new mongoose.Schema({
    plan_numero: {
        type: String,
        required: true
    },
    carrera: {
        type: String,
        required: true
    },
    materias: [
        {
            codigo: String,
            nombre: String,
            cuatrimestre: String,
            horas_semanales: Number,
            horas_totales: Number,
            correlativas: [String]
        }
    ]
})

export default mongoose.model('Plan', planSchema, 'plans')
