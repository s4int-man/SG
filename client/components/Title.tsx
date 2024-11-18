export const Title = (): React.ReactElement =>
{
    const style: React.CSSProperties =
    {
        fontSize: "50px",
    };

    return <div className="title" style={style}>
        {"Своя игра".toUpperCase()}
    </div>;
}