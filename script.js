
        let produtos = [];
        let editandoIndex = -1;

        // Carregar produtos do localStorage ao iniciar
        window.onload = function() {
            const produtosSalvos = localStorage.getItem('produtos');
            if (produtosSalvos) {
                produtos = JSON.parse(produtosSalvos);
                atualizarTabela();
            }
        };

        // Salvar produtos no localStorage
        function salvarProdutos() {
            localStorage.setItem('produtos', JSON.stringify(produtos));
        }

        // Gerar código EAN13 padrão brasileiro
        function gerarEAN13() {
            // Código do país Brasil: 789
            let codigo = '789';
            
            // Adicionar 9 dígitos aleatórios (código da empresa + produto)
            for (let i = 0; i < 9; i++) {
                codigo += Math.floor(Math.random() * 10);
            }
            
            // Calcular dígito verificador
            let soma = 0;
            for (let i = 0; i < 12; i++) {
                soma += parseInt(codigo[i]) * (i % 2 === 0 ? 1 : 3);
            }
            let digitoVerificador = (10 - (soma % 10)) % 10;
            codigo += digitoVerificador;
            
            document.getElementById('codigoBarras').value = codigo;
        }

        // Calcular preço de venda baseado em markup
        document.getElementById('markup').addEventListener('input', function() {
            const precoCusto = parseFloat(document.getElementById('precoCusto').value) || 0;
            const markup = parseFloat(this.value) || 0;
            
            if (precoCusto > 0 && markup > 0) {
                const precoVenda = precoCusto * (1 + markup / 100);
                document.getElementById('precoVenda').value = precoVenda.toFixed(2);
                
                // Calcular margem baseada no novo preço
                const margem = ((precoVenda - precoCusto) / precoVenda) * 100;
                document.getElementById('margem').value = margem.toFixed(2);
            }
        });

        // Calcular preço de venda baseado em margem
        document.getElementById('margem').addEventListener('input', function() {
            const precoCusto = parseFloat(document.getElementById('precoCusto').value) || 0;
            const margem = parseFloat(this.value) || 0;
            
            if (precoCusto > 0 && margem > 0 && margem < 100) {
                const precoVenda = precoCusto / (1 - margem / 100);
                document.getElementById('precoVenda').value = precoVenda.toFixed(2);
                
                // Calcular markup baseado no novo preço
                const markup = ((precoVenda - precoCusto) / precoCusto) * 100;
                document.getElementById('markup').value = markup.toFixed(2);
            }
        });

        // Calcular markup e margem quando preço de venda é alterado
        document.getElementById('precoVenda').addEventListener('input', function() {
            const precoCusto = parseFloat(document.getElementById('precoCusto').value) || 0;
            const precoVenda = parseFloat(this.value) || 0;
            
            if (precoCusto > 0 && precoVenda > 0) {
                const markup = ((precoVenda - precoCusto) / precoCusto) * 100;
                const margem = ((precoVenda - precoCusto) / precoVenda) * 100;
                
                document.getElementById('markup').value = markup.toFixed(2);
                document.getElementById('margem').value = margem.toFixed(2);
            }
        });

        // Formulário de cadastro
        document.getElementById('productForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const produto = {
                descricao: document.getElementById('descricao').value,
                precoCusto: parseFloat(document.getElementById('precoCusto').value),
                precoVenda: parseFloat(document.getElementById('precoVenda').value) || parseFloat(document.getElementById('precoCusto').value),
                unidade: document.getElementById('unidade').value,
                markup: parseFloat(document.getElementById('markup').value) || 0,
                margem: parseFloat(document.getElementById('margem').value) || 0,
                quantidade: parseInt(document.getElementById('quantidade').value),
                codigoBarras: document.getElementById('codigoBarras').value || 'N/A'
            };
            
            if (editandoIndex >= 0) {
                produtos[editandoIndex] = produto;
                editandoIndex = -1;
                document.getElementById('btnSubmit').innerHTML = '<span class="icon"><i class="fas fa-save"></i></span><span>Adicionar Produto</span>';
            } else {
                produtos.push(produto);
            }
            
            salvarProdutos();
            atualizarTabela();
            limparFormulario();
            
            // Notificação de sucesso
            alert('Produto salvo com sucesso!');
        });

        function limparFormulario() {
            document.getElementById('productForm').reset();
            document.getElementById('markup').value = 0;
            document.getElementById('margem').value = 0;
            document.getElementById('quantidade').value = 1;
            editandoIndex = -1;
            document.getElementById('btnSubmit').innerHTML = '<span class="icon"><i class="fas fa-save"></i></span><span>Adicionar Produto</span>';
        }

        function atualizarTabela() {
            const tbody = document.getElementById('productsBody');
            tbody.innerHTML = '';
            
            if (produtos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="11" class="has-text-centered">Nenhum produto cadastrado</td></tr>';
                atualizarTotais();
                return;
            }
            
            produtos.forEach((produto, index) => {
                const subtotal = produto.precoVenda * produto.quantidade;
                const tr = document.createElement('tr');
                
                tr.innerHTML = `
                    <td><input type="checkbox" class="produto-checkbox" data-index="${index}"></td>
                    <td>${produto.descricao}</td>
                    <td>R$ ${produto.precoCusto.toFixed(2)}</td>
                    <td>R$ ${produto.precoVenda.toFixed(2)}</td>
                    <td><span class="badge badge-info">${produto.unidade}</span></td>
                    <td>${produto.markup.toFixed(2)}%</td>
                    <td>${produto.margem.toFixed(2)}%</td>
                    <td>${produto.quantidade}</td>
                    <td><strong>R$ ${subtotal.toFixed(2)}</strong></td>
                    <td>${produto.codigoBarras}</td>
                    <td>
                        <button class="button is-small is-warning btn-action" onclick="editarProduto(${index})">
                            <span class="icon is-small">
                                <i class="fas fa-edit"></i>
                            </span>
                        </button>
                        <button class="button is-small is-danger btn-action" onclick="excluirProduto(${index})">
                            <span class="icon is-small">
                                <i class="fas fa-trash"></i>
                            </span>
                        </button>
                    </td>
                `;
                
                tbody.appendChild(tr);
            });
            
            atualizarTotais();
        }

        function atualizarTotais() {
            const totalProdutos = produtos.length;
            let totalCusto = 0;
            let totalComMarkup = 0;
            
            produtos.forEach(produto => {
                totalCusto += produto.precoCusto * produto.quantidade;
                totalComMarkup += produto.precoVenda * produto.quantidade;
            });
            
            const lucroTotal = totalComMarkup - totalCusto;
            
            document.getElementById('totalProdutos').textContent = totalProdutos;
            document.getElementById('totalCusto').textContent = `R$ ${totalCusto.toFixed(2)}`;
            document.getElementById('totalComMarkup').textContent = `R$ ${totalComMarkup.toFixed(2)}`;
            document.getElementById('lucroTotal').textContent = `R$ ${lucroTotal.toFixed(2)}`;
        }

        function editarProduto(index) {
            const produto = produtos[index];
            
            document.getElementById('descricao').value = produto.descricao;
            document.getElementById('precoCusto').value = produto.precoCusto;
            document.getElementById('precoVenda').value = produto.precoVenda;
            document.getElementById('unidade').value = produto.unidade;
            document.getElementById('markup').value = produto.markup;
            document.getElementById('margem').value = produto.margem;
            document.getElementById('quantidade').value = produto.quantidade;
            document.getElementById('codigoBarras').value = produto.codigoBarras !== 'N/A' ? produto.codigoBarras : '';
            
            editandoIndex = index;
            document.getElementById('btnSubmit').innerHTML = '<span class="icon"><i class="fas fa-edit"></i></span><span>Atualizar Produto</span>';
            
            // Scroll para o formulário
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function excluirProduto(index) {
            if (confirm('Deseja realmente excluir este produto?')) {
                produtos.splice(index, 1);
                salvarProdutos();
                atualizarTabela();
            }
        }

        function selecionarTodos() {
            const checkboxes = document.querySelectorAll('.produto-checkbox');
            const selectAll = document.getElementById('selectAll').checked;
            checkboxes.forEach(checkbox => {
                checkbox.checked = selectAll;
                const tr = checkbox.closest('tr');
                if (selectAll) {
                    tr.classList.add('selected-row');
                } else {
                    tr.classList.remove('selected-row');
                }
            });
        }

        // Adicionar classe ao selecionar checkbox individual
        document.addEventListener('change', function(e) {
            if (e.target.classList.contains('produto-checkbox')) {
                const tr = e.target.closest('tr');
                if (e.target.checked) {
                    tr.classList.add('selected-row');
                } else {
                    tr.classList.remove('selected-row');
                }
            }
        });

        function excluirSelecionados() {
            const checkboxes = document.querySelectorAll('.produto-checkbox:checked');
            if (checkboxes.length === 0) {
                alert('Selecione pelo menos um produto para excluir.');
                return;
            }
            
            if (confirm(`Deseja realmente excluir ${checkboxes.length} produto(s)?`)) {
                const indices = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index)).sort((a, b) => b - a);
                indices.forEach(index => produtos.splice(index, 1));
                salvarProdutos();
                atualizarTabela();
                document.getElementById('selectAll').checked = false;
            }
        }

        function exportarExcel() {
            if (produtos.length === 0) {
                alert('Não há produtos para exportar.');
                return;
            }
            
            const dados = produtos.map(p => ({
                'Descrição': p.descricao,
                'Preço Custo': p.precoCusto,
                'Preço Venda': p.precoVenda,
                'Unidade': p.unidade,
                'Markup (%)': p.markup,
                'Margem (%)': p.margem,
                'Quantidade': p.quantidade,
                'Subtotal': p.precoVenda * p.quantidade,
                'Código de Barras': p.codigoBarras
            }));
            
            const ws = XLSX.utils.json_to_sheet(dados);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Produtos');
            XLSX.writeFile(wb, 'produtos.xlsx');
        }

        function exportarCSV() {
            if (produtos.length === 0) {
                alert('Não há produtos para exportar.');
                return;
            }
            
            let csv = 'Descrição;Preço Custo;Preço Venda;Unidade;Markup (%);Margem (%);Quantidade;Subtotal;Código de Barras\n';
            
            produtos.forEach(p => {
                const subtotal = p.precoVenda * p.quantidade;
                csv += `${p.descricao};${p.precoCusto};${p.precoVenda};${p.unidade};${p.markup};${p.margem};${p.quantidade};${subtotal};${p.codigoBarras}\n`;
            });
            
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'produtos.csv';
            link.click();
        }

        function exportarPDF() {
            if (produtos.length === 0) {
                alert('Não há produtos para exportar.');
                return;
            }
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.setFontSize(18);
            doc.text('Lista de Produtos', 14, 22);
            
            doc.setFontSize(11);
            doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);
            
            const tableData = produtos.map(p => [
                p.descricao,
                `R$ ${p.precoCusto.toFixed(2)}`,
                `R$ ${p.precoVenda.toFixed(2)}`,
                p.unidade,
                `${p.markup.toFixed(2)}%`,
                `${p.margem.toFixed(2)}%`,
                p.quantidade,
                `R$ ${(p.precoVenda * p.quantidade).toFixed(2)}`
            ]);
            
            doc.autoTable({
                startY: 35,
                head: [['Descrição', 'Custo', 'Venda', 'Unid', 'Markup', 'Margem', 'Qtd', 'Subtotal']],
                body: tableData,
                theme: 'grid',
                styles: { fontSize: 8 }
            });
            
            const finalY = doc.lastAutoTable.finalY + 10;
            
            let totalCusto = 0;
            let totalComMarkup = 0;
            produtos.forEach(p => {
                totalCusto += p.precoCusto * p.quantidade;
                totalComMarkup += p.precoVenda * p.quantidade;
            });
            
            const lucroTotal = totalComMarkup - totalCusto;
            
            doc.setFontSize(10);
            doc.text(`Total de Produtos: ${produtos.length}`, 14, finalY);
            doc.text(`Total Custo: R$ ${totalCusto.toFixed(2)}`, 14, finalY + 7);
            doc.text(`Total com Markup/Margem: R$ ${totalComMarkup.toFixed(2)}`, 14, finalY + 14);
            doc.text(`Lucro Total: R$ ${lucroTotal.toFixed(2)}`, 14, finalY + 21);
            
            doc.save('produtos.pdf');
        }

        function importarArquivo(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    if (file.name.endsWith('.csv')) {
                        importarCSV(e.target.result);
                    } else if (file.name.endsWith('.xlsx')) {
                        importarExcel(e.target.result);
                    }
                } catch (error) {
                    alert('Erro ao importar arquivo: ' + error.message);
                }
            };
            
            if (file.name.endsWith('.csv')) {
                reader.readAsText(file);
            } else {
                reader.readAsBinaryString(file);
            }
            
            event.target.value = '';
        }

        function importarCSV(csv) {
            const linhas = csv.split('\n').slice(1);
            const novos = [];
            
            linhas.forEach(linha => {
                if (linha.trim()) {
                    const colunas = linha.split(';');
                    if (colunas.length >= 8) {
                        novos.push({
                            descricao: colunas[0],
                            precoCusto: parseFloat(colunas[1]) || 0,
                            precoVenda: parseFloat(colunas[2]) || 0,
                            unidade: colunas[3],
                            markup: parseFloat(colunas[4]) || 0,
                            margem: parseFloat(colunas[5]) || 0,
                            quantidade: parseInt(colunas[6]) || 1,
                            codigoBarras: colunas[8] || 'N/A'
                        });
                    }
                }
            });
            
            if (novos.length > 0) {
                produtos = produtos.concat(novos);
                salvarProdutos();
                atualizarTabela();
                alert(`${novos.length} produto(s) importado(s) com sucesso!`);
            }
        }

        function importarExcel(data) {
            const workbook = XLSX.read(data, { type: 'binary' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(firstSheet);
            
            const novos = rows.map(row => ({
                descricao: row['Descrição'] || '',
                precoCusto: parseFloat(row['Preço Custo']) || 0,
                precoVenda: parseFloat(row['Preço Venda']) || 0,
                unidade: row['Unidade'] || 'un',
                markup: parseFloat(row['Markup (%)']) || 0,
                margem: parseFloat(row['Margem (%)']) || 0,
                quantidade: parseInt(row['Quantidade']) || 1,
                codigoBarras: row['Código de Barras'] || 'N/A'
            }));
            
            if (novos.length > 0) {
                produtos = produtos.concat(novos);
                salvarProdutos();
                atualizarTabela();
                alert(`${novos.length} produto(s) importado(s) com sucesso!`);
            }
        }
    