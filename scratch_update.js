const fs = require('fs');
const file = 'src/data/sistemas.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

data.forEach(plan => {
    plan.materias.forEach(m => {
        m.mostrarCodigo = true;
    });
});

fs.writeFileSync(file, JSON.stringify(data, null, 4));
console.log('Update complete');
