const fakePdfFile = new File(
    [
        new Blob(['%PDF-1.4\n%Fake PDF content\n'], {
            type: 'application/pdf',
        }),
    ],
    'dummy.pdf',
    { type: 'application/pdf' }
);

export default fakePdfFile;
