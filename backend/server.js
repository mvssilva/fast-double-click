const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const FILE_PATH = path.join(__dirname, 'registros.json');

app.use(cors());
app.use(express.json());

// Lê os dados do arquivo JSON ou inicializa um array vazio caso o arquivo não exista
async function readRecords() {
    try {
        const data = await fs.readFile(FILE_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        throw error;
    }
}

// Salva e formata a lista atualizada de registros no arquivo JSON
async function saveRecords(records) {
    await fs.writeFile(FILE_PATH, JSON.stringify(records, null, 2));
}

// Rota POST: Cria e armazena um novo registro gerando o timestamp no back-end
app.post('/api/registros', async (req, res) => {
    try {
        const { timeMs } = req.body;
        
        if (typeof timeMs !== 'number') {
            return res.status(400).json({ error: 'Invalid or missing time.' });
        }

        const records = await readRecords();
        
        const newRecord = {
            id: Date.now().toString(),
            timeMs, 
            dateTime: new Date().toISOString() 
        };

        records.push(newRecord);
        await saveRecords(records);

        res.status(201).json(newRecord);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error saving the record.' });
    }
});

// Rota GET: Retorna os registros, aplicando regras de filtro por data e ordenação
app.get('/api/registros', async (req, res) => {
    try {
        let records = await readRecords();
        
        const { startDate, endDate, sortBy, order } = req.query;

        // Filtra o array de registros baseando-se em um intervalo de datas (YYYY-MM-DD)
        if (startDate || endDate) {
            records = records.filter(record => {
                const recordDate = record.dateTime.split('T')[0];
                
                const isStartValid = startDate ? recordDate >= startDate : true;
                const isEndValid = endDate ? recordDate <= endDate : true;
                
                return isStartValid && isEndValid;
            });
        }

        // Aplica ordenação dinâmica (crescente ou decrescente) por data ou tempo
        if (sortBy) {
            records.sort((a, b) => {
                let valueA, valueB;

                if (sortBy === 'date') {
                    valueA = new Date(a.dateTime).getTime();
                    valueB = new Date(b.dateTime).getTime();
                } else if (sortBy === 'time') {
                    valueA = a.timeMs;
                    valueB = b.timeMs;
                }

                if (order === 'desc') {
                    return valueB - valueA;
                }
                return valueA - valueB; 
            });
        }

        res.json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error fetching records.' });
    }
});

// Rota DELETE: Limpa todo o histórico de registros.
app.delete('/api/registros', async(req, res) => {
    try {
        await saveRecords([]);
        res.status(200).json({mensagem: 'Histórico apagado com sucesso.'});
    } catch (error) {
        console.erro(error);
        res.status(500).json({erro: 'Falha interna ao limpar histórico.'});
    }
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});