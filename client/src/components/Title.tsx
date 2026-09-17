export const Title = (): React.ReactElement =>
{
    return <div className="title" style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(36px, 8vw, 64px)',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--gold-bright)',
        textAlign: 'center',
    }}>
        Святая игра
    </div>;
}
