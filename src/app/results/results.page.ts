import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss'],
})
export class ResultsPage implements OnInit {
  public asociadoRecords: any[] = [];
  public cuotaRecords: any[] = [];
  public searchResults: any[] = [];
  public loading = false;
  public errorMessage = '';
  public asociadoSearch = '';
  public selectedAsociado: any = null;
  public mode: 'search' | 'details' = 'search';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadInitialAsociados();
  }

  private loadInitialAsociados(): void {
    this.loadItems();
  }

  public onSearch(): void {
    const query = this.asociadoSearch.trim();
    if (!query) {
      this.errorMessage = 'Ingrese un nombre o asociado para buscar.';
      return;
    }

    this.mode = 'search';
    this.selectedAsociado = null;
    this.cuotaRecords = [];
    this.searchResults = [];
    this.errorMessage = '';

    this.searchAsociados(query);
  }

  private searchAsociados(query: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.selectedAsociado = null;
    this.cuotaRecords = [];

    this.api.searchAsociados(query).subscribe({
      next: (rows) => {
        this.searchResults = rows;
        this.loading = false;
        if (!rows.length) {
          this.errorMessage = 'No se encontraron coincidencias.';
        }
      },
      error: (err) => {
        this.errorMessage = 'Error en la búsqueda. Revisa el backend.';
        console.error('API search error', err);
        this.loading = false;
      },
    });
  }

  public selectAsociado(item: any): void {
    this.selectedAsociado = item;
    this.mode = 'details';
    this.loadItems(item.asociado || item.ID || item.id);
  }

  public backToSearch(): void {
    this.mode = 'search';
    this.cuotaRecords = [];
    this.selectedAsociado = null;
  }

  public getMonthName(month: any): string {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const value = Number(month);
    return Number.isFinite(value) && value >= 1 && value <= 12 ? months[value - 1] : (month || 'N/A');
  }

  private loadItems(asociado?: string): void {
    this.loading = true;
    this.errorMessage = '';

    this.api.getItems(asociado).subscribe({
      next: (result) => {
        this.asociadoRecords = result.asociado;
        this.cuotaRecords = result.cuotas;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'No se pudo cargar la información. Revisa el backend y JSON.';
        console.error('API error', err);
        this.loading = false;
      },
    });
  }
}
