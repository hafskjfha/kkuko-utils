import DocsData from "./DocsData";

const DocsDataHome = async ({ params }: { params: { id: string } }) => {
    const {id} = await params
    return (
        <DocsData id={id} />
    )
}

export default DocsDataHome;