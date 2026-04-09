const generateYears = () => {
    const years = [];
    for (let i = 1980; i <= 2035; i++) {
        years.push({ key: String(i), label: String(i) });
    }
    return years;
};

const anios = generateYears();

const cuatris = [
    { key: "1", label: "1° Cuatrimestre" },
    { key: "2", label: "2° Cuatrimestre" },
]

const plans = [
    { key: "17.14", label: "17.14" },
    { key: "17.13", label: "17.13" },
]

export default {
    anios,
    cuatris,
    plans
}