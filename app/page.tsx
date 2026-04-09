import { parseLog } from '@/lib/parseLog';

async function Home() {

    const data = await fetch(
        'https://blast-recruiting.s3.eu-central-1.amazonaws.com/NAVIvsVitaGF-Nuke.txt',
        { next: {
            revalidate: 3600 // cache for 1 hour
        }}
    ).then((res) => res.text())
    .then((raw) => parseLog(raw));

    return (
        <div className="">
            <main className="">
                <div>
                    <h1>
                        Hello world
                    </h1>
                    { data && data.rounds.map((round, idx) => (
                        <div key={`round_${idx}`}>
                            { round.duration }<br></br>
                            { round.score[0] }<br></br>
                            { round.score[1] }<br></br>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

export default Home;
