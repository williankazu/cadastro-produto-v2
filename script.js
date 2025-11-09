
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

        // Função para copiar texto
        function copiarTexto(texto, mensagem) {
            // Usar a API moderna de clipboard
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(texto).then(() => {
                    mostrarNotificacao(mensagem || 'Copiado!');
                }).catch(err => {
                    // Fallback para método antigo
                    copiarTextoFallback(texto, mensagem);
                });
            } else {
                // Fallback para navegadores antigos
                copiarTextoFallback(texto, mensagem);
            }
        }

        // Fallback para copiar texto em navegadores antigos
        function copiarTextoFallback(texto, mensagem) {
            const textarea = document.createElement('textarea');
            textarea.value = texto;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                mostrarNotificacao(mensagem || 'Copiado!');
            } catch (err) {
                mostrarNotificacao('Erro ao copiar', 'danger');
            }
            document.body.removeChild(textarea);
        }

        // Mostrar notificação temporária
        function mostrarNotificacao(mensagem, tipo = 'success') {
            // Remover notificação existente se houver
            const notificacaoExistente = document.getElementById('notificacao-temp');
            if (notificacaoExistente) {
                notificacaoExistente.remove();
            }

            const notificacao = document.createElement('div');
            notificacao.id = 'notificacao-temp';
            notificacao.className = `notification is-${tipo}`;
            notificacao.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 200px; animation: slideIn 0.3s ease-out;';
            notificacao.innerHTML = `
                <button class="delete" onclick="this.parentElement.remove()"></button>
                ${mensagem}
            `;
            
            document.body.appendChild(notificacao);
            
            // Remover após 2 segundos
            setTimeout(() => {
                if (notificacao.parentElement) {
                    notificacao.style.animation = 'slideOut 0.3s ease-out';
                    setTimeout(() => notificacao.remove(), 300);
                }
            }, 2000);
        }

        // Adicionar animações CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

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

        // Copiar código de barras do formulário
        function copiarCodigoBarras() {
            const codigo = document.getElementById('codigoBarras').value;
            if (codigo) {
                copiarTexto(codigo, 'Código de barras copiado!');
            } else {
                mostrarNotificacao('Nenhum código de barras para copiar', 'warning');
            }
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
                const mensagem = 'Produto atualizado com sucesso!';
                editandoIndex = -1;
                document.getElementById('btnSubmit').innerHTML = '<span class="icon"><i class="fas fa-save"></i></span><span>Adicionar Produto</span>';
                salvarProdutos();
                atualizarTabela();
                limparFormulario();
                mostrarNotificacao(mensagem, 'success');
            } else {
                produtos.push(produto);
                salvarProdutos();
                atualizarTabela();
                limparFormulario();
                mostrarNotificacao('Produto adicionado com sucesso!', 'success');
            }
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
                    <td>
                        ${produto.descricao}
                        <i class="fas fa-copy btn-copy" onclick="copiarTexto('${produto.descricao.replace(/'/g, "\\'")}', 'Descrição copiada!')" title="Copiar descrição"></i>
                    </td>
                    <td>R$ ${produto.precoCusto.toFixed(2)}</td>
                    <td>R$ ${produto.precoVenda.toFixed(2)}</td>
                    <td><span class="badge badge-info">${produto.unidade}</span></td>
                    <td>${produto.markup.toFixed(2)}%</td>
                    <td>${produto.margem.toFixed(2)}%</td>
                    <td>${produto.quantidade}</td>
                    <td><strong>R$ ${subtotal.toFixed(2)}</strong></td>
                    <td>
                        ${produto.codigoBarras}
                        ${produto.codigoBarras !== 'N/A' ? `<i class="fas fa-copy btn-copy" onclick="copiarTexto('${produto.codigoBarras}', 'Código de barras copiado!')" title="Copiar código"></i>` : ''}
                    </td>
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
                mostrarNotificacao('Produto excluído com sucesso!', 'success');
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
                mostrarNotificacao('Selecione pelo menos um produto para excluir.', 'warning');
                return;
            }
            
            if (confirm(`Deseja realmente excluir ${checkboxes.length} produto(s)?`)) {
                const indices = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index)).sort((a, b) => b - a);
                indices.forEach(index => produtos.splice(index, 1));
                salvarProdutos();
                atualizarTabela();
                document.getElementById('selectAll').checked = false;
                mostrarNotificacao(`${checkboxes.length} produto(s) excluído(s) com sucesso!`, 'success');
            }
        }

        function exportarExcel() {
            if (produtos.length === 0) {
                mostrarNotificacao('Não há produtos para exportar.', 'warning');
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
            mostrarNotificacao('Arquivo Excel exportado com sucesso!', 'success');
        }

        function exportarCSV() {
            if (produtos.length === 0) {
                mostrarNotificacao('Não há produtos para exportar.', 'warning');
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
            mostrarNotificacao('Arquivo CSV exportado com sucesso!', 'success');
        }

        function exportarPDF() {
            if (produtos.length === 0) {
                mostrarNotificacao('Não há produtos para exportar.', 'warning');
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
            mostrarNotificacao('Arquivo PDF exportado com sucesso!', 'success');
        }

        function gerarEtiquetas() {
            const printArea = document.getElementById('printArea');
            printArea.innerHTML = '';
            
            produtos.forEach((produto, index) => {
                const etiqueta = document.createElement('div');
                etiqueta.className = 'etiqueta';
                
                const descricao = document.createElement('div');
                descricao.className = 'etiqueta-descricao';
                descricao.textContent = produto.descricao;
                
                const unidade = document.createElement('div');
                unidade.className = 'etiqueta-unidade';
                unidade.textContent = `Unidade: ${produto.unidade.toUpperCase()}`;
                
                const preco = document.createElement('div');
                preco.className = 'etiqueta-preco';
                preco.textContent = `R$ ${produto.precoVenda.toFixed(2)}`;
                
                const barcodeContainer = document.createElement('div');
                barcodeContainer.className = 'etiqueta-barcode';
                
                // Criar SVG para o código de barras
                if (produto.codigoBarras && produto.codigoBarras !== 'N/A' && produto.codigoBarras.length === 13) {
                    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    svg.id = `barcode-${index}`;
                    barcodeContainer.appendChild(svg);
                    
                    etiqueta.appendChild(descricao);
                    etiqueta.appendChild(unidade);
                    etiqueta.appendChild(preco);
                    etiqueta.appendChild(barcodeContainer);
                    
                    printArea.appendChild(etiqueta);
                    
                    // Gerar código de barras usando JsBarcode
                    try {
                        JsBarcode(`#barcode-${index}`, produto.codigoBarras, {
                            format: 'EAN13',
                            width: 1,
                            height: 25,
                            displayValue: true,
                            fontSize: 8,
                            margin: 1,
                            marginTop: 2,
                            marginBottom: 2
                        });
                    } catch (e) {
                        barcodeContainer.innerHTML = `<small style="font-size: 6pt;">${produto.codigoBarras}</small>`;
                    }
                } else {
                    const semCodigo = document.createElement('small');
                    semCodigo.textContent = 'Sem código';
                    semCodigo.style.cssText = 'color: #999; font-size: 6pt;';
                    barcodeContainer.appendChild(semCodigo);
                    
                    etiqueta.appendChild(descricao);
                    etiqueta.appendChild(unidade);
                    etiqueta.appendChild(preco);
                    etiqueta.appendChild(barcodeContainer);
                    
                    printArea.appendChild(etiqueta);
                }
            });
        }

        function visualizarEtiquetas() {
            if (produtos.length === 0) {
                mostrarNotificacao('Não há produtos para visualizar.', 'warning');
                return;
            }
            
            const printArea = document.getElementById('printArea');
            gerarEtiquetas();
            printArea.classList.add('active');
            
            // Scroll até a área de visualização
            setTimeout(() => {
                printArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
            
            // Adicionar botão para fechar visualização
            if (!document.getElementById('btnFecharVisualizacao')) {
                const btnFechar = document.createElement('button');
                btnFechar.id = 'btnFecharVisualizacao';
                btnFechar.className = 'button is-danger is-large';
                btnFechar.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1000;';
                btnFechar.innerHTML = '<span class="icon"><i class="fas fa-times"></i></span><span>Fechar Visualização</span>';
                btnFechar.onclick = function() {
                    printArea.classList.remove('active');
                    this.remove();
                };
                document.body.appendChild(btnFechar);
            }
        }

        function imprimirEtiquetas() {
            if (produtos.length === 0) {
                mostrarNotificacao('Não há produtos para imprimir.', 'warning');
                return;
            }
            
            const printArea = document.getElementById('printArea');
            gerarEtiquetas();
            printArea.classList.add('active');
            
            // Aguardar renderização dos códigos de barras e então imprimir
            setTimeout(() => {
                window.print();
                // Remover a classe active após a impressão
                setTimeout(() => {
                    printArea.classList.remove('active');
                }, 1000);
            }, 500);
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
                    mostrarNotificacao('Erro ao importar arquivo: ' + error.message, 'danger');
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
                mostrarNotificacao(`${novos.length} produto(s) importado(s) do CSV com sucesso!`, 'success');
            } else {
                mostrarNotificacao('Nenhum produto válido encontrado no arquivo CSV.', 'warning');
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
                mostrarNotificacao(`${novos.length} produto(s) importado(s) do Excel com sucesso!`, 'success');
            } else {
                mostrarNotificacao('Nenhum produto válido encontrado no arquivo Excel.', 'warning');
            }
        }
    