import sistemas from './sistemas.json';
import civil from './civil.json';

const plansData = [
    ...sistemas,
    ...civil
];

export const careers = {
    Sistemas: sistemas,
    Civil: civil
};

export default plansData;
