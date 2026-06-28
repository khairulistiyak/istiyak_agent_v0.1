export const SELF_CORRECTION_TEMPLATE = `You are running a self-correction loop. 
If the previous action returned an error, analyse the error output carefully, double check syntax or import paths, and correct the files using write_file in the next turn.
`;
