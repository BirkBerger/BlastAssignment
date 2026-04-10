import GameGraph from './components/GameGraph';
import { LogParser } from '@/lib/LogParser';

async function Home() {

    const data = await fetch(
        'https://blast-recruiting.s3.eu-central-1.amazonaws.com/NAVIvsVitaGF-Nuke.txt',
        { next: {
            revalidate: 3600 // cache for 1 hour
        }}
    ).then((res) => res.text())
    .then((raw) => new LogParser(raw).getData());

    return (
        <div className="">
            <main className="">
                <div>
                    <h1>
                        Hello world
                    </h1>
                    <GameGraph rounds={data.rounds} teamNames={data.teamNames}></GameGraph>
                    { data && Object.values(data.players).map((player, idx) => (
                        <div key={`player_${idx}`}>
                            { JSON.stringify(player) }
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

export default Home;
