import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Historico(){
    const [registros, setRegistros] = useState([]);
    const [filtros, setFiltros] = useState({startDate:'', endDate:'', sortBy:'', order:''});

    // busca informações no backend considerando os filtros
    const loadRegistros= async () =>{
        const query = new URLSearchParams(filtros).toString();
        const response = await fetch(`http://localhost:3000/api/registros?${query}`);
        const data = await response.json();
        setRegistros(data);
    }

    // incremento em relação a apagar o histórico de registro
    const limparHistorico = async () =>{
        const confirmacao = window.confirm("Tem certeza que deseja apagar todo o histórico? Essa ação não pode ser desfeita.")
    
        if(confirmacao){
            try {
                await fetch('http://localhost:3000/api/registros', {
                    method: 'DELETE'
                });
                loadRegistros();
            } catch (error) {
                console.error("Erro ao apagar o histórico: ", error)
            }
        }
    }

    // recarregando a lista dos registros
    useEffect(() => {
        loadRegistros();},
        [filtros]);

    return (
        <div className="min-h-screen bg-[#F4F4F0] font-sans text-zinc-900 px-8 py-6 flex flex-col">
            <header className="flex justify-between items-center border-b-2 border-zinc-900 pb-4 mb-4">
                <h1 className="text-md font-bold uppercase tracking-widest">Histórico</h1>
                <Link to={'/'} className="font-bold uppercase tracking-widest hover:text-zinc-500 transition-colors">Voltar</Link>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                <aside className="md:col-start-2 bg-zinc-200 p-6 rounded-lg h-fit space-y-6">
                    <h2 className="font-bold uppercase text-md tracking-widest">Filtros</h2>
                    
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold">Data Início</label>
                        <input type="date" onChange={(e) => setFiltros({...filtros, startDate: e.target.value})} className="p-2 border rounded" />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold">Data Fim</label>
                        <input type="date" onChange={(e) => setFiltros({...filtros, endDate: e.target.value})} className="p-2 border rounded" />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold">Ordenar por:</label>
                        <select onChange={(e) => setFiltros({...filtros, sortBy: e.target.value})} className="p-2 border rounded">
                            <option value="date">Data</option>
                            <option value="time">Tempo</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold">Ordem</label>
                        <select onChange={(e) => setFiltros({...filtros, order: e.target.value})} className="p-2 border rounded">
                            <option value="desc">Descendente</option>
                            <option value="asc">Ascendente</option>
                        </select>
                    </div>

                    {/* Botão de Limpeza Isolado */}
                    <button 
                        onClick={limparHistorico}
                        className="w-full p-4 border-2 border-red-500 text-red-600 font-bold uppercase tracking-widest rounded-lg hover:bg-red-500 hover:text-white transition-colors active:scale-95"
                    >
                        Limpar Histórico
                    </button>
                </aside>

                <main className="md:col-span-2">
                    <table className="w-full text-left border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                        <thead>
                            <tr className="bg-zinc-800 text-[#F4F4F0] uppercase text-sm">
                                <th className="p-4">Data/Hora</th>
                                <th className="p-4 text-right">Tempo (ms)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registros.map((reg) => (
                                <tr key={reg.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                                    <td className="p-4">{new Date(reg.dateTime).toLocaleString()}</td>
                                    <td className="p-4 font-mono font-bold text-right">{reg.timeMs} ms</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </main>
            </div>
        </div>
    )
}